//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./IERC20.sol";

contract VolkovCoin is IERC20{

    address private contractOwner;
    string public name;
    string public symbol;
    uint8 public constant DECIMAL = 18;
    uint256 public totalSupply;


    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) private allowed;

    constructor(string memory _name, string memory _symbol){
        name = _name;
        symbol = _symbol;
        contractOwner = msg.sender;
    }

    function owner() external view returns(address){
        return contractOwner;
    }

    function allowance(address _owner, address spender) external view returns(uint256){
        return allowed[_owner][spender];
    }
    
    modifier ownerOnly {
        require(msg.sender == contractOwner, "Access denied!");
        _;
    } 

    function _mint(address _to, uint256 amount) external ownerOnly{
        balanceOf[_to] += amount;
        totalSupply += amount;

        emit Transfer(address(0), _to, amount);
    }

    function _burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Burn amount higher than balance!");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }

    function transfer(address recipient, uint256 amount) external override returns (bool){
        require(balanceOf[msg.sender] >= amount, "Transfer amount exceeded!");
        require(recipient != address(0), "Recipient can't be zero address!");

        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;

        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool){
        require(spender != address(0), "Spender can't be zero address!");

        allowed[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool){
        require(sender != address(0), "Sender can't be zero address!");
        require(recipient != address(0), "Recipient can't be zero address!");
        require(balanceOf[sender] >= amount, "Transfer amount exceeded!");
        require(allowed[sender][msg.sender] >= amount, "Not enough allowance!");
        
        allowed[sender][msg.sender] -=amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);

        return true;
    }
}