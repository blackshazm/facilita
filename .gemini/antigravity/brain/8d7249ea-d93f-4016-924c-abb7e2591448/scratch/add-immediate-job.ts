import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function main() {
  const connection = new IORedis({
    host: 'localhost',
    port: 6379,
  });

  const queue = new Queue('referral-reward', { connection });

  const orderId = 'test-order-1778199530929';
  const refereeId = 'd313480a-3384-48f7-a88d-eac891fa8d52'; // +5511777777777
  const referrerId = '0072e115-2aca-4835-a113-3a57564c5625'; // +5511999999999

  console.log('Adding job with delay 0...');
  await queue.add(
    'process-reward',
    { orderId, refereeId, referrerId },
    { delay: 0 }
  );
  
  console.log('Job added.');
  await connection.quit();
}

main().catch(console.error);
