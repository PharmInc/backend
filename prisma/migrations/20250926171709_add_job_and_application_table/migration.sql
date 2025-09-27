-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "salaryMin" INTEGER NOT NULL,
    "salaryMax" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "shortDescription" TEXT,
    "salaryCurrency" TEXT DEFAULT 'INR',
    "applicationDeadline" TIMESTAMP(3),
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactPerson" TEXT,
    "additionalInfo" JSONB,
    "instituteId" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeUrl" TEXT NOT NULL,
    "coverLetter" TEXT,
    "experienceYears" INTEGER,
    "currentPosition" TEXT,
    "currentInstitute" TEXT,
    "additionalDetails" JSONB,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_JobSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobSpecialties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JobSpecialties_B_index" ON "public"."_JobSpecialties"("B");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "public"."Institute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JobSpecialties" ADD CONSTRAINT "_JobSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JobSpecialties" ADD CONSTRAINT "_JobSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
