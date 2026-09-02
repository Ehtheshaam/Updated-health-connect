-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "age" TEXT NOT NULL DEFAULT '',
    "gender" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "emergencyContact" TEXT NOT NULL DEFAULT '',
    "userType" TEXT NOT NULL DEFAULT 'patient',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SymptomReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SymptomReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "fileUrl" TEXT,
    CONSTRAINT "HealthRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "medicines" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending hospital acceptance',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hospital" TEXT NOT NULL,
    "doctor" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "fee" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
