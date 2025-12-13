-- CreateTable
CREATE TABLE "FilterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "impactMatrixId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilterPreset_impactMatrixId_idx" ON "FilterPreset"("impactMatrixId");

-- CreateIndex
CREATE INDEX "FilterPreset_name_idx" ON "FilterPreset"("name");

-- AddForeignKey
ALTER TABLE "FilterPreset" ADD CONSTRAINT "FilterPreset_impactMatrixId_fkey" FOREIGN KEY ("impactMatrixId") REFERENCES "ImpactMatrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;
