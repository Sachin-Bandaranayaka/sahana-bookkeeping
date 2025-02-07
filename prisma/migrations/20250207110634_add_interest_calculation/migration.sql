-- CreateTable
CREATE TABLE "InterestCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "calculationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysElapsed" INTEGER NOT NULL,
    "interestAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterestCalculation_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
