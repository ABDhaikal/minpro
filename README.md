## 

# creating template express prisma

## manual creating template

1. initialize `package json`
`npm i —y`
2. install typescript, types/node types/express nodemon ts-node and types/cors -d
`npm i typescript @types/node @types/express nodemon ts-node @types/cors -d`
3. install express ,cors ,and prisma
 `npm i express cors dotenv prisma @prisma/client`
4. initialize tsc
`tsc —init`
5. change `tsconfig.json` `outdir`

```json
{
   "compilerOptions": {
      "target": "es2016",
      "module": "commonjs",
      "outDir": "./dist",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true
   }
}

```

so default `tsconfig.json` should be 

```json
{
   "compilerOptions": {
      "target": "es2016",
      "module": "commonjs",
      "outDir": "./dist",
      "esModuleInterop": true,
      "forceConsistentCasingInFileNames": true,
      "strict": true,
      "skipLibCheck": true
   }
}

```

1. go to `package.json`  and add comment to run dev run build and run start

```
"scripts": {
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "dev": "nodemon src/index.ts"
  },
```

1. create  `src/config/env.ts`

```tsx
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT
```

1. create `src/index.ts`

```tsx
import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";

// define the express app
const app = express();
// app cors
app.use(cors());

// define express json for parsing json data
app.use(express.json());

// your routes should be here

// your error middle ware
app.use(errorMiddleware);
// listening to the server
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
```

1. initialize prisma

`npx prisma init`

1. setup `prisma/schema.prisma` into default

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

1. create `src/config/prisma.ts`

```
import { PrismaClient } from "@prisma/client";

export default new PrismaClient();
```

1. create middleware folder and file `src/middlewares/error.middleware.ts`

```
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const errorMiddleware = (
   err: ApiError,
   _req: Request,
   res: Response,
   next: NextFunction
) => {
   const status = err.status || 500;
   const message = err.message || "Something went wrong";
   res.status(status).send(message);
};

```

1. create utils folder and file  `src/utils/api-error.ts`

```
export class ApiError extends Error {
   status: number;
   constructor(message: string, status: number = 500) {
      super(message);
      this.status = status;
   }
}
```

1. add your error middleware to your index.ts so its can be run

```tsx
import express from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
// your routes should be here

// your error middle ware
app.use(errorMiddleware);

// listening to the server
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});

```

1. create another template folder

```tsx
mkdir src/controllers
mkdir src/routes
mkdir src/types
mkdir src/services
mkdir src/validators
```

## how to create new model and service

1. create your dummy table in `prisma/schema.prisma`

```
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

1. create your service file in `src/service/get-users.service.ts`

```
import prisma from "../config/prisma";
import { ApiError } from "../utils/api-error";

export const getUsersService = async () => {
   try {
      const users = await prisma.user.findMany();
      return users;
   } catch (error) {
      throw new ApiError("Error fetching users", 500);
   }
};
```

1. create controller on `src/controllers/user.controller.ts`

```
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { getUsersService } from "../services/get-users.service";

export const getUsersController = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const users = await getUsersService();
      res.status(200).json(users);
   } catch (error) {
      next(new ApiError("Error fetching users", 500));
   }
};

```

1. create your routes file on `src/routes/user.router.ts`

```
import { Router } from "express";
import { getUsersController } from "../controllers/user.controller";

const router = Router();

// Define the all routes for the user router
router.get("/", getUsersController);
export default router;
```

1. add your router into index.ts
`app.use("/users", userRouter);`
2. generate prisma db
`npx prisma generate`
3. to run your code you can use `npm run dev` on your terminal