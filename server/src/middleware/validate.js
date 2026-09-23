import { ZodError } from 'zod';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req[source]);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request data'
      });
    }
  };
}
