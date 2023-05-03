import { assert } from 'assert-ts';
import { valueProviderResponseSchema } from './valueProviderResponse';

describe('project', () => {
  it('parses the valueProviderResponse', () => {
    const result = valueProviderResponseSchema.safeParse([
      {
        key: 'WORKFLOW_SELECT_SAMPLE',
        value: 'option2',
        workName: 'complexWorkFlow',
        propertyPath: 'complexWorkFlow',
      },
    ]);

    assert(result.success);

    expect(result.data.length).toBe(1);
  });
});
