-- CreateTable
CREATE TABLE "LapseReason" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "nudgeStage" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LapseReason_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LapseReason" ADD CONSTRAINT "LapseReason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
