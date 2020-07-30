pragma solidity >=0.4.24 <0.7.0;
pragma experimental ABIEncoderV2;

contract batchingProtocol {
    Record[] public records;
    struct Record {
        address location;
        uint96 amount;
    }
    
    struct RawSlice {
        uint256 length;
        uint256 ptr;
    }
    
    uint8 constant STRING_SHORT_START = 0x80;
    uint8 constant STRING_LONG_START  = 0xb8;
    uint8 constant LIST_SHORT_START   = 0xc0;
    uint8 constant LIST_LONG_START    = 0xf8;
    uint256 lastBatchedRecord = 0;

    function parseRLP(uint memPtr) private pure returns (RawSlice memory data, uint len) {
        uint byte0;
        assembly {
            byte0 := byte(0, mload(memPtr))
        }

        uint offset;
        uint data_len;
        if (byte0 < STRING_SHORT_START)
            (offset, data_len) = (0,1);
        
        else if (byte0 < STRING_LONG_START)
            (offset, data_len) = (1, byte0 - STRING_SHORT_START);

        else if (byte0 < LIST_SHORT_START) {
            uint byteLen = byte0 - STRING_LONG_START; // # of bytes the actual length is
            offset = 1 + byteLen;
                
            /* 32 byte word size */
            assembly {
                data_len := div(mload(add(memPtr,1)), exp(256, sub(32, byteLen))) // right shifting to get the len
            }
        }

        else if (byte0 < LIST_LONG_START) {
            (offset, data_len) = (1, byte0 - LIST_SHORT_START);
        } 

        else {
            uint byteLen = byte0 - LIST_LONG_START;
            offset = 1 + byteLen;

            assembly {
                let dataLen := div(mload(add(memPtr,1)), exp(256, sub(32, byteLen))) // right shifting to the correct length
            }
        }
        return (RawSlice(data_len,memPtr+offset), offset+data_len);
    }
    function readUint(uint ptr, uint len) private pure returns(uint) {
        uint result;
        assembly {
            result := mload(ptr)
            if lt(len, 32) {
                result := div(result, exp(256, sub(32, len)))
            }
        }
        return result;
    }
    function batchRead(bytes memory input) public {
        uint memPtr;
        assembly {
            memPtr := add(input, 0x20)
        }
        uint end = memPtr + input.length;
        uint byte0 = readUint(memPtr, 1);
        memPtr += 1;
        if (byte0 == 0) {
            batchType1(memPtr,end);
        } else if (byte0 == 1) {
            batchType2(memPtr,end);
        } else if (byte0 == 3) {
            batchType3(memPtr,end);
        } else {
            batchType4(memPtr,end);
        }
    }
    function batchType1(uint memPtr, uint end) private {
        address location;
        uint96 amount;
        uint len;
        uint read;
        uint consumed;
        RawSlice memory data;
        uint nextPtr;
        while(memPtr < end) {
            read = readUint(memPtr,20);
            location = address(read);
            memPtr += 20;
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            read = readUint(nextPtr,len);
            amount = uint96(read);
            records.push(Record(location, amount));
            memPtr += consumed;
        }
    }
    function batchType2(uint memPtr, uint end) private {
        address location;
        uint96 amount;
        uint len;
        uint read;
        uint consumed;
        RawSlice memory data;
        uint nextPtr;
        uint num_addresses;
        while(memPtr < end) {
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            read = readUint(nextPtr,len);
            amount = uint96(read);
            memPtr += consumed;
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            num_addresses = readUint(nextPtr,len);
            memPtr += consumed;
            for(uint i = 0; i < num_addresses; i++) {
                read = readUint(memPtr,20);
                location = address(read);
                memPtr += 20;
                records.push(Record(location, amount));
            }
        }
    }
    function batchType3(uint memPtr, uint end) private {
        uint location;
        uint96 amount;
        uint len;
        uint read;
        uint consumed;
        RawSlice memory data;
        uint nextPtr;
        while(memPtr < end) {
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            location = readUint(nextPtr,len);
            memPtr += consumed;
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            read = readUint(nextPtr,len);
            amount = uint96(read);
            if (location < records.length) {
                records[location].amount += amount;
            }
            memPtr += consumed;
        }
    }
    function batchType4(uint memPtr, uint end) private {
        uint location;
        uint96 amount;
        uint len;
        uint read;
        uint consumed;
        RawSlice memory data;
        uint nextPtr;
        uint num_addresses;
        while(memPtr < end) {
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            read = readUint(nextPtr,len);
            amount = uint96(read);
            memPtr += consumed;
            (data, consumed) = parseRLP(memPtr);
            (nextPtr,len) = (data.ptr, data.length);
            num_addresses = readUint(nextPtr,len);
            memPtr += consumed;
            for(uint i = 0; i < num_addresses; i++) {
                (data, consumed) = parseRLP(memPtr);
                (nextPtr,len) = (data.ptr, data.length);
                location = readUint(nextPtr,len);
                memPtr += consumed;
                records[location].amount += amount;
            }
        }
    }
    function totalRecords() public view returns (uint256) {
        return records.length;
    }
}