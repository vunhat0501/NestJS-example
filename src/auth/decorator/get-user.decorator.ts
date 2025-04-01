import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Custom decorator to extract user info from request object
export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
      // Get the request object from execution context
      const request: Express.Request = ctx.switchToHttp().getRequest();

      // If a specific property is request, return it
      if (data) {
        return request.user ? request.user[data] : undefined;
      }

      // Otherwise return the whole user
      return request.user;
    },
);