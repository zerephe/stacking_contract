//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DemirBank is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;
    ERC20 public stakeToken;
    ERC20 public rewardToken;

    uint256 public rewardCo;
    uint256 public rewardLockTime;
    uint256 public tokenLockTime;

    mapping(address => StakeToken) private stakes;

    struct StakeToken {
        uint256 amount;
        uint256 timestamp;
        bool isClaimed;
    }

    constructor(address _lpToken, address _rewardToken) {
        rewardCo = 25;
        rewardLockTime = 10 seconds;
        tokenLockTime = 20 seconds;
        stakeToken = ERC20(_lpToken);
        rewardToken = ERC20(_rewardToken);
    }

    function stake(uint256 amount) external nonReentrant returns(bool) {        
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] = StakeToken(amount, block.timestamp, false);

        return true;
    }

    function unstake() external nonReentrant returns(bool) {
        uint256 _locktime = stakes[msg.sender].timestamp + tokenLockTime;
        require(_locktime <= block.timestamp, "Too soon to unstake mf!");
        require(stakes[msg.sender].amount > 0, "Nothing to unstake mf!");

        stakeToken.safeTransfer(msg.sender, stakes[msg.sender].amount);

        if(!stakes[msg.sender].isClaimed){
            _claim(msg.sender);
        }

        stakes[msg.sender].amount = 0;

        return true;
    }

    function claim() external nonReentrant returns(bool) {

        _claim(msg.sender);

        return true;
    }

    function _claim(address _owner) private returns(bool) {
        uint256 _locktime = stakes[_owner].timestamp + rewardLockTime;
        require(_locktime <= block.timestamp, "Too soon to claim reward mf!");
        require(stakes[_owner].amount > 0, "You are not a staker mf!");
        require(!stakes[_owner].isClaimed, "Nothing to claim mf!");

        uint256 _reward = stakes[_owner].amount.mul(rewardCo).div(100);
        rewardToken.safeTransfer(_owner, _reward);

        stakes[msg.sender].isClaimed = true;

        return true;
    }

    function setReward(uint256 _rewardCo) external onlyOwner returns(bool) {
        require(_rewardCo <= 100, "Too high reward mf!");

        rewardCo = _rewardCo;

        return true;
    }

    function setLockTime(uint256 _tokenLockTime, uint256 _rewardLockTime) external onlyOwner returns(bool) {
        require(_tokenLockTime >= 1, "Min token locktime is 1 mf!");
        require(_rewardLockTime >= _tokenLockTime + 1, "Min reward locktime is higher mf!");

        tokenLockTime = _tokenLockTime * 1 seconds;
        rewardLockTime = _rewardLockTime * 1 seconds;

        return true;
    }

    function getStakeAmount(address _owner) external view returns(uint256) {
        return stakes[_owner].amount;
    }
}
