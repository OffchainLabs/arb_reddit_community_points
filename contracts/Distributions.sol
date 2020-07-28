/**
 *Submitted for verification at Etherscan.io on 2020-06-09
*/

// File: @openzeppelin/upgrades/contracts/Initializable.sol

pragma solidity >=0.4.24 <0.6.0;

import "./lib.sol";



contract Distributions_v0 is Initializable, Ownable, UpdatableGSNRecipientSignature {

    struct SharedOwner {
        address account;
        uint256 percent; // e.g. 30% percent = 30 * percentPrecision/100
    }

    struct DistributionRound {
        uint256 availablePoints;
        uint256 sharedOwnersAvailablePoints;
        uint256 totalKarma;
    }

    event SharedOwnerUpdated(
        address indexed _from,
        address indexed _to,
        uint256 _percent
    );

    event AdvanceRound(uint256 round, uint256 totalPoints, uint256 sharedOwnersPoints);
    event ClaimPoints(uint256 round, address indexed user, uint256 karma, uint256 points);
    event KarmaSourceUpdated(address _karmaSource, address _prevKarmaSource);
    event SupplyDecayPercentUpdated(uint256 supplyDecayPercent);
    event RoundsBeforeExpirationUpdated(uint256 roundsBeforeExpiration);

    using SafeMath for uint256;
    using Address for address;

    // ------------------------------------------------------------------------------------
    // VARIABLES BLOCK, MAKE SURE ONLY ADD TO THE END

    address public subredditPoints;
    address public karmaSource;
    string public subreddit;
    string private _subredditLowerCase;
    uint256 public lastRound;
    uint256 public startBlockNumber;
    // maps round number to round data
    mapping(uint256 => DistributionRound) private _distributionRounds;
    // maps account to next claimable round
    mapping(address => uint256) public claimableRounds;

    // when sharing percentage, the least possible share is 1/percentPrecision
    uint256 public constant PERCENT_PRECISION = 1000000;
    uint256 public constant MAX_ROUND_SUPPLY = 10**11 * 10**18; // max is 100 bln, to prevent overflows

    // 1 shared owner ~ 35k gas + 250k gas for other ops in advanceToRound
    // so we limit to (8M - 250k)/35k = 221 maximum shared owners
    uint256 public constant MAX_SHARED_OWNERS = 200;

    uint256 public constant MAX_SKIP_ROUNDS = 10;

    uint256 public initialSupply;
    uint256 public roundsBeforeExpiration;
    uint256 public nextSupply;
    uint256 public supplyDecayPercent;

    // those owners if exists will get proportion of minted points according to value in percentage
    SharedOwner[] public sharedOwners;
    uint256 private _prevRoundSupply;       // supply in a prev round
    uint256 private _prevClaimed;           // total claimed in a prev round

    // Previous karmaSource signer. Used when rotating karmaSource key to enable
    // previous signer to still be valid for a while.
    address public prevKarmaSource;

    // END OF VARS
    // ------------------------------------------------------------------------------------


    function initialize(
        address owner_,
        address subredditPoints_,                    // ISubredditPoints + IERC20 token contract address
        address karmaSource_,                        // Karma source provider address
        address gsnApprover_,                        // GSN approver address

        uint256 initialSupply_,
        uint256 nextSupply_,
        uint256 initialKarma_,
        uint256 roundsBeforeExpiration_,              // how many rounds are passed before claiming is possible
        uint256 supplyDecayPercent_,                  // defines percentage of next rounds' supply from the current
        address[] calldata sharedOwners_,
        uint256[] calldata sharedOwnersPercs_           // index of percentages must correspond to _sharedOwners array
    ) external initializer {
        require(initialSupply_ > 0 && initialSupply_ <= MAX_ROUND_SUPPLY, "Distributions: initial supply should be > 0 and <= MAX_ROUND_SUPPLY");
        require(initialKarma_ > 0, "Distributions: initial karma should be more than 0");
        require(nextSupply_ > 0 && nextSupply_ <= MAX_ROUND_SUPPLY, "Distributions: nextSupply should be > 0 and <= MAX_ROUND_SUPPLY");
        require(karmaSource_ != address(0), "Distributions: karma source should not be 0");
        require(gsnApprover_ != address(0), "Distributions: GSN approver should not be 0");
        require(owner_ != address(0), "Distributions: owner should not be 0");
        require(sharedOwners_.length == sharedOwnersPercs_.length, "Shared owners: Addresses array must be same length as percentages");

        Ownable.initialize(owner_);
        UpdatableGSNRecipientSignature.initialize(gsnApprover_);
        updateSupplyDecayPercent(supplyDecayPercent_);
        updateRoundsBeforeExpiration(roundsBeforeExpiration_);

        subredditPoints = subredditPoints_;
        karmaSource = karmaSource_;
        prevKarmaSource = karmaSource_;
        subreddit = ISubredditPoints(subredditPoints_).subreddit();
        _subredditLowerCase = _toLower(subreddit);

        startBlockNumber = block.number;

        initialSupply = initialSupply_;
        nextSupply = nextSupply_;

        for (uint i = 0; i < sharedOwners_.length; i++) {
            _updateSharedOwner(sharedOwners_[i], sharedOwnersPercs_[i]);
        }

        uint256 sharedOwnersPoints = calcSharedOwnersAvailablePoints(initialSupply);
        _distributionRounds[0] = DistributionRound({
            availablePoints: initialSupply,
            sharedOwnersAvailablePoints: sharedOwnersPoints,
            totalKarma: initialKarma_
        });

        emit AdvanceRound(0, initialSupply, sharedOwnersPoints);
    }

    function claim(uint256 round, address account, uint256 karma, bytes calldata signature) external {
        require(karma > 0, "Distributions: karma should be > 0");
        require(claimableRounds[account] <= round, "Distributions: this rounds points are already claimed");
        require(round <= lastRound, "Distributions: too early to claim this round");
        uint256 mc = minClaimableRound();
        require(round >= mc, "Distributions: too late to claim this round");

        address signedBy = verifySignature(account, round, karma, signature);
        require(signedBy == karmaSource || (prevKarmaSource != address(0) && signedBy == prevKarmaSource), "Distributions: claim is not signed by the karma source");

        DistributionRound memory dr = _distributionRounds[round];
        require(dr.availablePoints > 0, "Distributions: no points to claim in this round");
        require(dr.totalKarma > 0, "Distributions: this round has no karma");
        uint256 userPoints = dr.availablePoints
            .sub(dr.sharedOwnersAvailablePoints)
            .mul(karma)
            .div(dr.totalKarma);
        require(userPoints > 0, "Distributions: user karma is too low to claim points");
        _prevClaimed = _prevClaimed.add(userPoints);
        claimableRounds[account] = round.add(1);
        emit ClaimPoints(round, account, karma, userPoints);
        ISubredditPoints(subredditPoints).mint(address(this), account, userPoints, "", "");
    }

    // corresponding _distributionRounds mappings are added with
    //  + every next distribution supply is `previous - decay` and stored in nextSupply
    //  + distributed 50% of burned points in a previous round
    // rounds are removed if they are not claimable anymore
    function advanceToRound(uint256 round, uint256 totalKarma) external {
        require((round > lastRound) && (round < lastRound + MAX_SKIP_ROUNDS), "Distributions: round should be > lastRound and < lastRound + MAX_SKIP_ROUNDS");
        require(totalKarma > 0, "Distributions: totalKarma should be > 0");
        require(_msgSender() == karmaSource, "Distributions: only karma source can advance rounds");
        uint256 mc = minClaimableRound();

        if (mc >= (round - lastRound)) {
            for (uint256 i = mc - (round - lastRound); i < mc; i++) {
                delete(_distributionRounds[i]);
            }
        }

        uint256 ts = IERC20(subredditPoints).totalSupply();
        uint256 prevClaimedCopy = _prevClaimed;

        // normally this loop should complete in 1 cycle
        // we move backwards from last to previous rounds
        for (uint256 i = round; i >= (lastRound + 1) && i >= mc; i--) {
            uint256 roundPoints = nextSupply;

            // reintroduce 50 % of previously burned tokens
            uint256 ps = _prevRoundSupply.add(_prevClaimed);
            if (ps > ts) {
                roundPoints = roundPoints.add(ps.sub(ts).div(2));
            }

            // if there is more than 1 cycle, all burned will be reintroduced into the last round
            // the loop is not stopped due to it may switch to halving for a previous rounds
            _prevRoundSupply = ts;
            _prevClaimed = 0;

            if (nextSupply > 0 && supplyDecayPercent > 0) {
                nextSupply = nextSupply.sub(nextSupply.mul(supplyDecayPercent).div(PERCENT_PRECISION));
            }

            uint256 sharedOwnersPoints = 0;
            if (roundPoints > 0) {
                sharedOwnersPoints = calcSharedOwnersAvailablePoints(roundPoints);
                _distributionRounds[i] = DistributionRound({
                    availablePoints: roundPoints,
                    sharedOwnersAvailablePoints: sharedOwnersPoints,
                    totalKarma: 0
                });
            }

            emit AdvanceRound(i, roundPoints, sharedOwnersPoints);
        }

        lastRound = round;
        _prevRoundSupply = ts;
        _prevClaimed = 0;

        DistributionRound storage dc = _distributionRounds[round];
        dc.totalKarma = totalKarma;

        // distribute shared cut, but no more than it was claimed by users
        // this protects from exceeding total amount by increasing percentage between rounds
        if (dc.sharedOwnersAvailablePoints > 0 && prevClaimedCopy > 0) {
            uint256 totalSharedPercent;
            for (uint256 i = 0; i < sharedOwners.length; i++) {
                totalSharedPercent = totalSharedPercent.add(sharedOwners[i].percent);
            }

            uint256 claimedPlusShared = prevClaimedCopy
                .mul(PERCENT_PRECISION)
                .div(PERCENT_PRECISION.sub(totalSharedPercent));

            uint256 sharedLeft = claimedPlusShared.sub(prevClaimedCopy);

            for (uint256 i = 0; i < sharedOwners.length && sharedLeft > 0; i++) {
                uint256 ownerPoints = claimedPlusShared.mul(sharedOwners[i].percent).div(PERCENT_PRECISION);
                if (ownerPoints > 0 && ownerPoints <= sharedLeft) {
                    ISubredditPoints(subredditPoints).mint(address(this), sharedOwners[i].account, ownerPoints, "", "");
                    sharedLeft = sharedLeft.sub(ownerPoints);
                }
            }
        }
    }

    function totalSharedOwners() external view returns (uint256) {
        return sharedOwners.length;
    }

    function updateSupplyDecayPercent(uint256 _supplyDecayPercent) public onlyOwner {
        require(_supplyDecayPercent < PERCENT_PRECISION, "Distributions: supplyDecayPercent should be < PERCENT_PRECISION");
        supplyDecayPercent = _supplyDecayPercent;
        emit SupplyDecayPercentUpdated(_supplyDecayPercent);
    }

    function updateRoundsBeforeExpiration(uint256 _roundsBeforeExpiration) public onlyOwner {
        roundsBeforeExpiration = _roundsBeforeExpiration;
        emit RoundsBeforeExpirationUpdated(_roundsBeforeExpiration);
    }

    function minClaimableRound() public view returns (uint256) {
        if (lastRound >= roundsBeforeExpiration) {
            return lastRound.sub(roundsBeforeExpiration);
        }
        return 0;
    }

    function verifySignature(address account, uint256 round, uint256 karma, bytes memory signature)
        private view returns (address) {

        bytes32 hash = keccak256(abi.encode(_subredditLowerCase, uint256(round), account, karma));
        bytes32 prefixedHash = ECDSA.toEthSignedMessageHash(hash);
        return ECDSA.recover(prefixedHash, signature);
    }

    function calcSharedOwnersAvailablePoints(uint256 points) private view returns (uint256) {
        uint256 r;
        for (uint256 i = 0; i < sharedOwners.length; i++) {
            r = r.add(calcSharedPoints(points, sharedOwners[i]));
        }
        return r;
    }

    function calcSharedPoints(uint256 points, SharedOwner memory sharedOwner) private pure returns (uint256) {
        return points
            .mul(sharedOwner.percent)
            .div(PERCENT_PRECISION);
    }

    function updateKarmaSource(address _karmaSource) external onlyOwner {
        require(_karmaSource != address(0), "Distributions: karma source should not be 0");
        prevKarmaSource = karmaSource;
        karmaSource = _karmaSource;
        emit KarmaSourceUpdated(_karmaSource, prevKarmaSource);
    }

    function updateGSNApprover(address gsnApprover) external onlyOwner {
        updateSigner(gsnApprover);
    }

    // shared owners get their points 1 round later within advancement
    // increasing total shared percentage can lead to some of the owners not receiving their cut within a next round
    function updateSharedOwner(address account, uint256 percent) external onlyOwner {
        _updateSharedOwner(account, percent);
    }

    function _updateSharedOwner(address account, uint256 percent) internal {
        require(percent < PERCENT_PRECISION, "Distributions: shared owners percent should be < percentPrecision");
        require(percent > 0 && sharedOwners.length < MAX_SHARED_OWNERS, "Distributions: shared owners limit reached, see MAX_SHARED_OWNERS");

        bool updated = false;

        for (uint256 i = 0; i < sharedOwners.length; i++) {
            SharedOwner memory so = sharedOwners[i];
            if (so.account == account) {
                if (percent == 0) {
                    if (i != (sharedOwners.length - 1)) { // if it's not last element, replace it from the tail
                        sharedOwners[i] = sharedOwners[sharedOwners.length-1];
                    }
                    // remove tail
                    sharedOwners.length = sharedOwners.length - 1;
                } else {
                    sharedOwners[i].percent = percent;
                }
                updated = true;
            }
        }

        if (!updated) {
            if (percent == 0) {
                return;
            }
            sharedOwners.push(SharedOwner(account, percent));
        }

        checkSharedPercentage();
        // allow to update sharedOwnersAvailablePoints for a rounds which aren't claimed yet
        DistributionRound storage dr = _distributionRounds[lastRound];
        if (_prevClaimed == 0 && dr.availablePoints > 0) {
            dr.sharedOwnersAvailablePoints = calcSharedOwnersAvailablePoints(dr.availablePoints);
        }
        emit SharedOwnerUpdated(_msgSender(), account, percent);
    }

    function checkSharedPercentage() private view {
        uint256 total;
        for (uint256 i = 0; i < sharedOwners.length; i++) {
            total = sharedOwners[i].percent.add(total);
        }
        require(total < PERCENT_PRECISION, "Distributions: can't share all 100% of points");
    }

    function percentPrecision() external pure returns (uint256) {
        return PERCENT_PRECISION;
    }

    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((int8(bStr[i]) >= 65) && (int8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(int8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}