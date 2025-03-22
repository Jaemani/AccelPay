// src/lib/xrpl/wallet.js
const xrpl = require('xrpl');
const { getClient } = require('./client');

/**
 * 새로운 XRP 지갑을 생성하고 테스트넷 Faucet으로부터 초기 자금을 받습니다.
 * 
 * @returns {Promise<Object>} 생성된 지갑 정보 (주소, 공개키, 비밀키, 초기 잔액)
 */
async function createWallet() {
  try {
    const client = await getClient();
    
    // Testnet Faucet을 통해 초기 자금이 포함된 새 지갑 생성
    const fundResult = await client.fundWallet();
    const wallet = fundResult.wallet;
    
    // 지갑 정보 반환 (비밀키는 실제 서비스에서는 클라이언트에 반환하지 않는 것이 보안상 좋음)
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      seed: wallet.seed, // 주의: 실제 서비스에서는 클라이언트에 반환하지 않아야 함
      balance: xrpl.dropsToXrp(fundResult.balance) // Drops를 XRP로 변환
    };
  } catch (error) {
    console.error('지갑 생성 중 오류 발생:', error);
    throw new Error(`지갑 생성 실패: ${error.message}`);
  }
}

/**
 * 시드(비밀키)로부터 지갑을 복구합니다.
 * 
 * @param {string} seed - 지갑의 시드(비밀키)
 * @returns {Object} 복구된 지갑 객체
 */
function recoverWalletFromSeed(seed) {
  try {
    const wallet = xrpl.Wallet.fromSeed(seed);
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      seed: wallet.seed
    };
  } catch (error) {
    console.error('시드로부터 지갑 복구 중 오류 발생:', error);
    throw new Error(`지갑 복구 실패: ${error.message}`);
  }
}

/**
 * 지갑 주소의 XRP 잔액을 조회합니다.
 * 
 * @param {string} address - 잔액을 조회할 지갑 주소
 * @returns {Promise<string>} XRP 잔액
 */
async function getWalletBalance(address) {
  try {
    const client = await getClient();
    
    // 계정 정보 요청
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    // Drops를 XRP로 변환하여 반환
    return xrpl.dropsToXrp(response.result.account_data.Balance);
  } catch (error) {
    // 계정을 찾을 수 없는 경우 (아직 활성화되지 않은 계정)
    if (error.message.includes('Account not found')) {
      return '0';
    }
    console.error('잔액 조회 중 오류 발생:', error);
    throw new Error(`잔액 조회 실패: ${error.message}`);
  }
}

/**
 * 고정된 NFT 발급 지갑을 가져오거나 생성합니다.
 * 시스템에서 모든 NFT 발급에 사용할 단일 지갑을 관리합니다.
 * 
 * @returns {Promise<xrpl.Wallet>} NFT 발급 지갑
 */
async function getNFTIssuerWallet() {
  try {
    // 환경 변수에서 NFT 발급 지갑 시드 확인
    const issuerSeed = process.env.NFT_ISSUER_SEED;
    
    // 시드가 있으면 기존 지갑 복구
    if (issuerSeed) {
      return xrpl.Wallet.fromSeed(issuerSeed);
    }
    
    // 시드가 없으면 새 지갑 생성 (실제 서비스에서는 새 지갑을 환경 변수에 저장하는 로직 필요)
    const client = await getClient();
    const fundResult = await client.fundWallet();
    console.log('새 NFT 발급 지갑 생성됨:', fundResult.wallet.address);
    console.log('이 시드를 환경 변수(NFT_ISSUER_SEED)에 설정하세요:', fundResult.wallet.seed);
    
    return fundResult.wallet;
  } catch (error) {
    console.error('NFT 발급 지갑 가져오기 중 오류 발생:', error);
    throw new Error(`NFT 발급 지갑 가져오기 실패: ${error.message}`);
  }
}

module.exports = {
  createWallet,
  recoverWalletFromSeed,
  getWalletBalance,
  getNFTIssuerWallet
};