# Backend for Frontend (BFF) - Blog

### The project aims to integrate s3 with nestjs


#### Clone reposiory:

```bash
git clone https://github.com/0helison/s3-aws-nestjs.git
```

### Services

* Upload

#### Start the container with the following command:

```bash
docker-compose up --build -d
```

#### Then run the next command:

```bash
docker-compose exec -it bff bash
```

#### * All commands from now on must be done in a bash terminal inside the container *

#### In bash terminal install node modules :

```bash
npm install
```

#### Create a .env file with the information present in .env.example:

```bash
S3_ACCESS_KEY= # Access Key ID
S3_SECRET_ACCESS_KEY= # Secret Access Key
S3_REGION= # Region 
S3_BUCKET_NAME= # Bucket Name 
```

#### Run the tests in bash terminal:

```bash
npm run test
```

#### Now run the application in bash terminal:

```bash
npm run start:dev
```

#### In postman, use verb HTTP POST, add one image file e send a request:

```bash
http://localhost:3000/upload
```

