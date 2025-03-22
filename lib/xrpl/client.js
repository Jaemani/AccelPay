// src/lib/xrpl/client.js
import * as xrpl from 'xrpl';

// 싱글톤 패턴으로 XRPL 클라이언트 구현
let client = null;

/**
 * XRPL 테스트넷에 연결된 클라이언트를 제공합니다.
 * 싱글톤 패턴으로 구현되어 애플리케이션 전체에서 하나의 클라이언트 인스턴스를 공유합니다.
 * 
 * @returns {Promise<xrpl.Client>} 연결된 XRPL 클라이언트
 */
export async function getClient() {
  if (!client || !client.isConnected()) {
    const testnetUrl = process.env.XRPL_TESTNET_URL || 'wss://s.altnet.rippletest.net:51233';
    client = new xrpl.Client(testnetUrl);
    
    try {
      console.log('Connecting to XRPL Testnet...');
      await client.connect();
      console.log('Connected to XRPL Testnet');
      
      // 자동 재연결 이벤트 핸들러 설정
      client.on('disconnected', async (code) => {
        console.log(`XRPL 연결 끊김, 코드: ${code}. 재연결 시도 중...`);
        try {
          await client.connect();
          console.log('XRPL에 재연결 성공');
        } catch (error) {
          console.error('XRPL 재연결 실패:', error);
        }
      });
    } catch (error) {
      console.error('XRPL 연결 실패:', error);
      throw new Error(`XRPL Testnet 연결 실패: ${error.message}`);
    }
  }
  return client;
}

/**
 * 애플리케이션 종료 시 XRPL 클라이언트 연결을 안전하게 종료합니다.
 */
export async function disconnectClient() {
  if (client && client.isConnected()) {
    console.log('Disconnecting from XRPL Testnet...');
    await client.disconnect();
    console.log('Disconnected from XRPL Testnet');
    client = null;
  }
}

/**
 * 연결 상태를 확인하고 필요시 재연결을 시도합니다.
 * 
 * @returns {Promise<boolean>} 연결 성공 여부
 */
export async function ensureConnection() {
  try {
    if (client && !client.isConnected()) {
      await client.connect();
    } else if (!client) {
      await getClient();
    }
    return true;
  } catch (error) {
    console.error('XRPL 연결 확인 실패:', error);
    return false;
  }
}