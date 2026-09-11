-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "station" TEXT NOT NULL,
    "stationUrl" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Broadcast_fixtureId_countryCode_idx" ON "Broadcast"("fixtureId", "countryCode");
CREATE UNIQUE INDEX "Broadcast_fixtureId_countryCode_station_key" ON "Broadcast"("fixtureId", "countryCode", "station");

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
