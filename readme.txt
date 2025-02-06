//git Push

git init
git remote add origin https://github.com/MaharajaOne/cbptdashboard.git
git branch -M main
git push -u origin main

git add .
git commit -m "message"
git push https://github.com/MaharajaOne/cbptdashboard.git


git pull origin main

//to know the all the tables in my schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';  -- Replace with your schema name

//to know my schema
SELECT schema_name
FROM information_schema.schemata;

//to know all the column in particular table

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'  -- Replace 'public' with your schema name if necessary
  AND table_name = 'monthlyreport';

New
=ifs(J23171<=H23171,"Instances that met original date", J23171<=I23171, "met revised date",J23171>=I23171,"delivered late")

G= Received
date
(MM/DD)	
H= Actual date	
I= Proposed date	
J= Delivered date (MM/DD)

delivered_date<=actual_date = met original date
delivered_date<=proposed_Date= metreviseddate
delivereddate>=proposeddate= delviered late