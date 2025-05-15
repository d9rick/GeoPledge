# GeoPledge Application

## Requirements

### Copy ./GeoPledge/.env.example to ./GeoPledge/.env and replace any keys you may not have already.
```bash
cp ./GeoPledge/.env.example ./GeoPledge/.env
```

### Install `npm` requirements
```bash
cd GeoPledge
npm install
```

## Run The server
```bash
cd backend
./mvnw spring-boot:run
```

## Run The Frontend
```bash
cd GeoPledge
npx expo start
```

Scan the QR code provided, and use the Expo Go app or the webpage to test/develop. It will autoupdate as you edit the frontend.

## Notes
You must start the server and expo frontend in different terminals. Will write a script to automatically do this later.
