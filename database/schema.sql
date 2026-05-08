CREATE TABLE "Restaurant" (
  "RestaurantId" INT,
  "RestaurantName" VARCHAR(100),
  "RestaurantWebsite" VARCHAR(100),
  "RestaurantEmail" VARCHAR(150),
  "RestaurantPhoneNumber" VARCHAR(20),
  "Address" VARCHAR(100),
  PRIMARY KEY ("RestaurantId")
);

CREATE TABLE "RestaurantMeals" (
  "RestaurantMealId" INT,
  "RestaurantId" INT,
  "MealName" VARCHAR(50),
  "Cuisine" VARCHAR(50),
  "Price" NUMERIC(10,2),
  PRIMARY KEY ("RestaurantMealId"),
  CONSTRAINT "FK_RestaurantMeals_RestaurantId"
    FOREIGN KEY ("RestaurantId")
      REFERENCES "Restaurant"("RestaurantId")
);

CREATE TABLE "Users" (
  "UserId" INT,
  "Username" VARCHAR(50),
  "Email" VARCHAR(100),
  "Password" VARCHAR(200),
  PRIMARY KEY ("UserId")
);

CREATE TABLE "Media" (
  "MediaID" INT,
  "UserId" INT,
  "RestaurantMealId" INT,
  "Date" DATE,
  "ImageAsText" TEXT,
  PRIMARY KEY ("MediaID"),
  CONSTRAINT "FK_Media_RestaurantMealId"
    FOREIGN KEY ("RestaurantMealId")
      REFERENCES "RestaurantMeals"("RestaurantMealId"),
  CONSTRAINT "FK_Media_UserId"
    FOREIGN KEY ("UserId")
      REFERENCES "Users"("UserId")
);

CREATE TABLE "RestaurantVisit" (
  "RestaurantVisitId" INT,
  "RestaurantId" INT,
  "UserId" INT,
  "DateVisited" DATE,
  PRIMARY KEY ("RestaurantVisitId"),
  CONSTRAINT "FK_RestaurantVisit_UserId"
    FOREIGN KEY ("UserId")
      REFERENCES "Users"("UserId"),
  CONSTRAINT "FK_RestaurantVisit_RestaurantId"
    FOREIGN KEY ("RestaurantId")
      REFERENCES "Restaurant"("RestaurantId")
);

CREATE TABLE "MealRatings" (
  "MealRatingId" INT,
  "UserId" INT,
  "RestaurantMealId" INT,
  "RatingOneToTen" INT CHECK ("RatingOneToTen" BETWEEN 1 AND 10),
  "Comments" VARCHAR(1000),
  "RatingDate" DATE,
  PRIMARY KEY ("MealRatingId"),
  CONSTRAINT "FK_MealRatings_UserId"
    FOREIGN KEY ("UserId")
      REFERENCES "Users"("UserId"),
  CONSTRAINT "FK_MealRatings_RestaurantMealId"
    FOREIGN KEY ("RestaurantMealId")
      REFERENCES "RestaurantMeals"("RestaurantMealId")
);

CREATE TABLE "RestaurantRatings" (
  "RestaurantRatingId" INT,
  "RestaurantId" INT,
  "UserId" INT,
  "RatingOneToTen" INT CHECK ("RatingOneToTen" BETWEEN 1 AND 10),
  "Comments" VARCHAR(1000),
  "RatingDate" DATE,
  PRIMARY KEY ("RestaurantRatingId"),
  CONSTRAINT "FK_RestaurantRatings_RestaurantId"
    FOREIGN KEY ("RestaurantId")
      REFERENCES "Restaurant"("RestaurantId"),
  CONSTRAINT "FK_RestaurantRatings_UserId"
    FOREIGN KEY ("UserId")
      REFERENCES "Users"("UserId")
);

CREATE TABLE "Wishlist" (
  "WishId" INT,
  "UserId" INT,
  "RestaurantId" INT,
  "FoodsToTry" VARCHAR(100),
  PRIMARY KEY ("WishId"),
  CONSTRAINT "FK_Wishlist_RestaurantId"
    FOREIGN KEY ("RestaurantId")
      REFERENCES "Restaurant"("RestaurantId"),
  CONSTRAINT "FK_Wishlist_UserId"
    FOREIGN KEY ("UserId")
      REFERENCES "Users"("UserId")
);
