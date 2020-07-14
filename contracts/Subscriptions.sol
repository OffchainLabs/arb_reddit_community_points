/**
 *Submitted for verification at Etherscan.io on 2020-06-09
*/

// File: @openzeppelin/upgrades/contracts/Initializable.sol

pragma solidity >=0.4.24 <0.6.0;

import "./lib.sol";





contract Subscriptions_v0 is Initializable, Ownable, UpdatableGSNRecipientSignature {
    using SafeMath for uint256;
    using Address for address;

    event Subscribed(address indexed recipient, address indexed payer, uint256 burnedPoints, uint256 expiresAt, bool renewable);
    event Canceled(address indexed recipient, uint256 expiresAt);
    event DurationUpdated(uint256 duration);
    event PriceUpdated(uint256 price);
    event RenewBeforeUpdated(uint256 renewBefore);

    // ------------------------------------------------------------------------------------
    // VARIABLES BLOCK, MAKE SURE ONLY ADD TO THE END

    uint256 private _renewBefore;
    uint256 private _duration;
    uint256 private _price;

    // maps address to expiration time
    mapping(address => uint256) private _subscriptions;
    // maps address of recipient to address of payer
    mapping(address => address) private _payers;
    address private _subredditPoints;

    // END OF VARS
    // ------------------------------------------------------------------------------------

    function initialize(
        address owner_,
        address gsnApprover,
        address subredditPoints,
        uint256 price_,
        uint256 duration_,
        uint256 renewBefore_
    ) external initializer {
        require(owner_ != address(0), "Subscriptions: owner should not be 0");

        Ownable.initialize(owner_);
        UpdatableGSNRecipientSignature.initialize(gsnApprover);
        _subredditPoints = subredditPoints;

        updatePrice(price_);
        updateDuration(duration_);
        updateRenewBefore(renewBefore_);
    }

    function cancel(address recipient) external {
        address payer = _payers[recipient];
        require(_msgSender() == payer || _msgSender() == recipient, "Subscriptions: subscription can be cancelled by payer or recipient only");
        delete _payers[recipient];
        emit Canceled(recipient, _subscriptions[recipient]);
    }

    function renew(address recipient) external {
        address payer = _payers[recipient];
        require(payer != address(0), "Subscriptions: subscription is canceled");
        // solium-disable-next-line security/no-block-members
        require(expiration(recipient) < block.timestamp.add(_renewBefore), "Subscriptions: too early to renew");
        _subscribe(payer, recipient, true);
    }

    function subscribe(address recipient, bool renewable) external {
        address payer = _msgSender();
        if (renewable) {
            _payers[recipient] = payer;
        }
        _subscribe(payer, recipient, renewable);
    }

    function _subscribe(address payer, address recipient, bool renewable) internal {
        require(recipient != address(0), "Subscriptions: recipient should not be 0");
        uint256 expirationAt = _subscriptions[recipient];
        // solium-disable-next-line security/no-block-members
        if (expirationAt < block.timestamp) {
            // solium-disable-next-line security/no-block-members
            expirationAt = block.timestamp;
        }
        uint256 newExpiration = expirationAt.add(_duration);
        _subscriptions[recipient] = newExpiration;
        emit Subscribed(recipient, payer, _price, newExpiration, renewable);
        ISubredditPoints(_subredditPoints).operatorBurn(payer, _price, "", "");
    }

    function updateDuration(uint256 duration_) public onlyOwner {
        require(duration_ > 0, "Subscriptions: duration should be > 0");
        _duration = duration_;
        emit DurationUpdated(duration_);
    }

    function updatePrice(uint256 price_) public onlyOwner {
        require(price_ > 0, "Subscriptions: price should be > 0");
        _price = price_;
        emit PriceUpdated(price_);
    }

    function updateRenewBefore(uint256 renewBefore_) public onlyOwner {
        require(renewBefore_ > 0, "Subscriptions: renewBefore should be > 0");
        _renewBefore = renewBefore_;
        emit RenewBeforeUpdated(renewBefore_);
    }

    function duration() external view returns (uint256) {
        return _duration;
    }

    function price() external view returns (uint256) {
        return _price;
    }

    function renewBefore() external view returns (uint256) {
        return _renewBefore;
    }

    function expiration(address account) public view returns (uint256) {
        return _subscriptions[account];
    }

    function updateGSNApprover(address gsnApprover) external onlyOwner {
        updateSigner(gsnApprover);
    }
}