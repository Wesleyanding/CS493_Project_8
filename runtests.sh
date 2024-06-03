!/bin/bash

# Get businesses 
output=$(curl -s -X GET http://localhost:8000/businesses)

# Get the first business ID
business_id=$(echo $output | jq -r '.[0].id')

echo "Business ID: $business_id"

echo "\n Sending a png to the business"
photo=$(curl -s -X POST http://localhost:8000/photos \
    -F "photo=@./test.png" \
    -F "metadata={\"caption\": \"test\", \"business_id\": \"$business_id\"}"
)

echo -e "\n$photo"

echo $photo
photo_id=$(echo $photo | jq -r '.id')

echo "Photo ID: $photo_id\n"

curl http://localhost:8000/photos/$photo_id 

echo "\n\n"
echo -e "downloading the photo\n"
curl -o downloadtest.png http://localhost:8000/photos/$photo_id.png
echo -e "\n\n"

echo -e "downloading the thumb"
curl -o downloadtest_thumb.png http://localhost:8000/photos/$photo_id/thumb.jpg
echo -e "\n\n"

echo -e "Get business photos"
curl http://localhost:8000/businesses/$business_id/photos
echo -e "\n\n"

echo -e "Get one photo"
curl http://localhost:8000/photos/$photo_id
echo -e "\n\n"

echo -e "Testing complete\n"

