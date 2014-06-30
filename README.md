What This Is
------------

This is a sample implementation of ReadMe's user app management, which let's you delegate the interface users use to sign up and create apps to ReadMe.

To Install
---------

    git clone https://github.com/readme/readme-api-example.git
    cd readme-api-example
    npm install

To Run
------

    npm start

Test It Out
-----------

**Create An App / User**

    curl http://localhost:8080/create --data "user=test@test.com&readme_user_secret=1234&app_name=Test%20App%20Name&app_id=test_app_name_1234&readme_secret=ABCD"

**Update An App**

    curl http://localhost:8080/update/test_app_name_1234 --data "user=test@test.com&readme_user_secret=1234&app_name=Test%20App%20Name&refresh_keys=true&readme_secret=ABCD" -X PUT

**Delete An App**

    curl http://localhost:8080/delete/test_app_name_1234 --data "user=test@test.com&readme_user_secret=1234&readme_secret=ABCD" -X DELETE

