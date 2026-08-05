import {
  firstIncompleteStage,
  SESSION_STAGE_ORDER,
  stageCompleted,
  totalSessionMinutes,
} from '../sessionGuide';

describe('sessionGuide', () => {
  test('session has six ordered stages', () => {
    expect(SESSION_STAGE_ORDER).toHaveLength(6);
    expect(SESSION_STAGE_ORDER[0]).toBe('anchor');
    expect(SESSION_STAGE_ORDER[5]).toBe('checkin');
  });

  test('total duration is about fifteen minutes', () => {
    expect(totalSessionMinutes()).toBeGreaterThanOrEqual(14);
    expect(totalSessionMinutes()).toBeLessThanOrEqual(18);
  });

  test('firstIncompleteStage resumes at the right step', () => {
    expect(firstIncompleteStage({ anchor: true })).toBe('conditioning');
    expect(
      firstIncompleteStage({
        anchor: true,
        conditioning: true,
        control: true,
        release: true,
        rewire: true,
      }),
    ).toBe('checkin');
    expect(firstIncompleteStage({})).toBe('anchor');
  });

  test('stageCompleted reflects each training item independently', () => {
    expect(stageCompleted('anchor', { anchor: true })).toBe(true);
    expect(stageCompleted('conditioning', { anchor: true })).toBe(false);
    expect(
      stageCompleted('checkin', {
        anchor: true,
        conditioning: true,
        control: true,
        release: true,
        rewire: true,
      }),
    ).toBe(true);
    expect(stageCompleted('checkin', { anchor: true })).toBe(false);
  });
});
