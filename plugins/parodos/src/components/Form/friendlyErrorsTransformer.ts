import type { RJSFValidationError } from '@rjsf/utils';

export const friendlyErrorsTransformer = (errors: RJSFValidationError[]) => {
  return errors.map(err =>
    err?.message?.includes('must match pattern')
      ? { ...err, message: 'invalid uri' }
      : err,
  );
};
