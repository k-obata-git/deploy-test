-- CreateTable
CREATE TABLE "MasterQuestion" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "masterQuestionId" INTEGER NOT NULL,

    CONSTRAINT "MasterOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MasterOption" ADD CONSTRAINT "MasterOption_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
