import { JobEntity, JobStatus } from './job.entity';

describe('JobEntity', () => {
  const makeJob = (overrides?: Partial<{
    status: JobStatus;
    providerId: string;
  }>): JobEntity => {
    return new JobEntity(
      'job-1',
      'client-1',
      'service-1',
      12000, // R$ 120,00
      'Rua das Flores, 123',
      overrides?.status,
      overrides?.providerId,
    );
  };

  describe('constructor', () => {
    it('should default status to PENDING', () => {
      const job = makeJob();
      expect(job.status).toBe(JobStatus.PENDING);
    });

    it('should calculate platformFeeCents as 15% of totalCents', () => {
      const job = makeJob();
      expect(job.platformFeeCents).toBe(1800); // 15% of 12000
    });

    it('should calculate payoutCents as totalCents - platformFeeCents', () => {
      const job = makeJob();
      expect(job.payoutCents).toBe(10200); // 12000 - 1800
    });
  });

  describe('accept()', () => {
    it('should set providerId and status to ACCEPTED', () => {
      const job = makeJob();
      job.accept('provider-1');
      expect(job.providerId).toBe('provider-1');
      expect(job.status).toBe(JobStatus.ACCEPTED);
    });

    it('should throw if job is not PENDING', () => {
      const job = makeJob({ status: JobStatus.ACCEPTED, providerId: 'p1' });
      expect(() => job.accept('provider-2')).toThrow('Job is no longer pending');
    });
  });

  describe('start()', () => {
    it('should change status to IN_PROGRESS', () => {
      const job = makeJob({ status: JobStatus.ACCEPTED, providerId: 'p1' });
      job.start();
      expect(job.status).toBe(JobStatus.IN_PROGRESS);
    });

    it('should throw if job is not ACCEPTED', () => {
      const job = makeJob();
      expect(() => job.start()).toThrow('Job must be accepted to be started');
    });
  });

  describe('complete()', () => {
    it('should change status to COMPLETED', () => {
      const job = makeJob({ status: JobStatus.IN_PROGRESS, providerId: 'p1' });
      job.complete();
      expect(job.status).toBe(JobStatus.COMPLETED);
    });

    it('should throw if job is not IN_PROGRESS', () => {
      const job = makeJob({ status: JobStatus.ACCEPTED, providerId: 'p1' });
      expect(() => job.complete()).toThrow('Job must be in progress to be completed');
    });
  });

  describe('full lifecycle', () => {
    it('should transition PENDING → ACCEPTED → IN_PROGRESS → COMPLETED', () => {
      const job = makeJob();
      expect(job.status).toBe(JobStatus.PENDING);

      job.accept('provider-1');
      expect(job.status).toBe(JobStatus.ACCEPTED);

      job.start();
      expect(job.status).toBe(JobStatus.IN_PROGRESS);

      job.complete();
      expect(job.status).toBe(JobStatus.COMPLETED);
    });
  });
});
