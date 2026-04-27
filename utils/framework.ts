export class MethodLogger {
  public static logMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);

    async function replacementMethod(this: any, ...args: any[]) {
      const startTs = Date.now();

      console.log(`# Method started: ${methodName}`);
      if (args && args.length > 0) {
        args.forEach((arg, i) => {
          console.log(`  ARG[${i}]: ${arg ? JSON.stringify(arg) : arg}`);
        });
      }

      try {
        const result = await originalMethod.call(this, ...args);

        const duration = Date.now() - startTs;

        if (result !== undefined) {
          console.log(`  ${methodName} RESULT: ${JSON.stringify(result)}`);
        }

        console.log(`# Method succeeded: ${methodName} in ${duration}ms`);
        return result;
      } catch (error: any) {
        const duration = Date.now() - startTs;
        console.error(`# Method FAILED: ${methodName} with error: ${error.message} in ${duration}ms`);
        throw error;
      }
    }

    return replacementMethod;
  }
}
