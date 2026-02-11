// Simple Validation for Your Schema
export const BodySchema = {
  safeParse: (data: any) => {
    try {
      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
};
