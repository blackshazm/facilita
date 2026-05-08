import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function main() {
  const connection = new IORedis({
    host: 'localhost',
    port: 6379,
  });

  const queue = new Queue('referral-reward', { connection });

  const jobs = await queue.getJobs(['delayed', 'waiting', 'active']);
  
  console.log(`Found ${jobs.length} jobs in referral-reward queue:`);
  jobs.forEach(job => {
    console.log(`- Job ID: ${job.id}`);
    console.log(`  Name: ${job.name}`);
    console.log(`  Data: ${JSON.stringify(job.data)}`);
    const delay = job.opts.delay || 0;
    console.log(`  Delay: ${delay}ms (${delay / 1000 / 60 / 60 / 24} days)`);
    console.log('---');
  });

  await connection.quit();
}

main().catch(console.error);
