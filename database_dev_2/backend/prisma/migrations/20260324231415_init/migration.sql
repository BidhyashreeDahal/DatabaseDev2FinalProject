-- CreateTable
CREATE TABLE "role" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(35) NOT NULL,
    "description" VARCHAR(200),

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "first_name" VARCHAR(35) NOT NULL,
    "last_name" VARCHAR(35) NOT NULL,
    "email" VARCHAR(35) NOT NULL,
    "password_hash" VARCHAR(75) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_date" DATE NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "address" (
    "address_id" SERIAL NOT NULL,
    "address_type" VARCHAR(35) NOT NULL,
    "address_line1" VARCHAR(50) NOT NULL,
    "address_line2" VARCHAR(50),
    "city" VARCHAR(35) NOT NULL,
    "province" VARCHAR(35) NOT NULL,
    "postal_code" VARCHAR(10) NOT NULL,
    "country" VARCHAR(35) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" SERIAL NOT NULL,
    "first_name" VARCHAR(35) NOT NULL,
    "last_name" VARCHAR(35) NOT NULL,
    "email" VARCHAR(35),
    "phone" VARCHAR(15),
    "notes" VARCHAR(300),
    "created_date" DATE NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "customer_address" (
    "customer_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,

    CONSTRAINT "customer_address_pkey" PRIMARY KEY ("customer_id","address_id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "payment_method_id" SERIAL NOT NULL,
    "payment_method" VARCHAR(35) NOT NULL,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("payment_method_id")
);

-- CreateTable
CREATE TABLE "author" (
    "author_id" SERIAL NOT NULL,
    "name" VARCHAR(35) NOT NULL,

    CONSTRAINT "author_pkey" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "cartographer" (
    "cartographer_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "cartographer_pkey" PRIMARY KEY ("cartographer_id")
);

-- CreateTable
CREATE TABLE "publisher" (
    "publisher_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "publisher_pkey" PRIMARY KEY ("publisher_id")
);

-- CreateTable
CREATE TABLE "source" (
    "source_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(35),
    "phone" VARCHAR(15),

    CONSTRAINT "source_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "dealer" (
    "source_id" INTEGER NOT NULL,
    "specialty" VARCHAR(100),
    "reliability_rating" INTEGER,
    "price_range_notes" VARCHAR(300),
    "negotiation_notes" VARCHAR(300),

    CONSTRAINT "dealer_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "collector" (
    "source_id" INTEGER NOT NULL,
    "collecting_interests" VARCHAR(300),
    "notes" VARCHAR(300),

    CONSTRAINT "collector_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "estate" (
    "source_id" INTEGER NOT NULL,
    "estate_name" VARCHAR(100) NOT NULL,
    "contact_person" VARCHAR(100),
    "notes" VARCHAR(300),

    CONSTRAINT "estate_pkey" PRIMARY KEY ("source_id")
);

-- CreateTable
CREATE TABLE "item" (
    "item_id" SERIAL NOT NULL,
    "title" VARCHAR(35) NOT NULL,
    "description" VARCHAR(200),
    "condition" VARCHAR(100) NOT NULL,
    "acquisition_date" DATE NOT NULL,
    "acquisition_cost" DECIMAL(12,2) NOT NULL,
    "selling_price" DECIMAL(12,2) NOT NULL,
    "image_url" VARCHAR(500),
    "note" VARCHAR(300),

    CONSTRAINT "item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "acquisition" (
    "acquisition_id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "acquisition_pkey" PRIMARY KEY ("acquisition_id")
);

-- CreateTable
CREATE TABLE "book" (
    "item_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "publishing_year" DATE NOT NULL,
    "edition" VARCHAR(35) NOT NULL,
    "isbn" VARCHAR(20) NOT NULL,
    "binding_type" VARCHAR(35) NOT NULL,
    "genre" VARCHAR(50),

    CONSTRAINT "book_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "map" (
    "item_id" INTEGER NOT NULL,
    "cartographer_id" INTEGER,
    "publisher_id" INTEGER,
    "publishing_year" DATE,
    "scale" VARCHAR(35),
    "map_type" VARCHAR(35) NOT NULL,

    CONSTRAINT "map_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "periodical" (
    "item_id" INTEGER NOT NULL,
    "publisher_id" INTEGER,
    "issue_date" DATE NOT NULL,
    "issue_number" VARCHAR(35),
    "subject_coverage" VARCHAR(200),

    CONSTRAINT "periodical_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "price_history_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "market_value" DECIMAL(12,2) NOT NULL,
    "recorded_date" DATE NOT NULL,
    "source" VARCHAR(50) NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("price_history_id")
);

-- CreateTable
CREATE TABLE "provenance" (
    "provenance_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "previous_owner" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "verified_status" BOOLEAN NOT NULL,
    "note" VARCHAR(300),

    CONSTRAINT "provenance_pkey" PRIMARY KEY ("provenance_id")
);

-- CreateTable
CREATE TABLE "sales" (
    "sales_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "sales_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("sales_id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer" ADD CONSTRAINT "dealer_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collector" ADD CONSTRAINT "collector_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate" ADD CONSTRAINT "estate_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acquisition" ADD CONSTRAINT "acquisition_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source"("source_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acquisition" ADD CONSTRAINT "acquisition_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("author_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publisher"("publisher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map" ADD CONSTRAINT "map_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map" ADD CONSTRAINT "map_cartographer_id_fkey" FOREIGN KEY ("cartographer_id") REFERENCES "cartographer"("cartographer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map" ADD CONSTRAINT "map_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publisher"("publisher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodical" ADD CONSTRAINT "periodical_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodical" ADD CONSTRAINT "periodical_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publisher"("publisher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provenance" ADD CONSTRAINT "provenance_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "item"("item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;
