
from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Course
from assessments.models import (
    CourseAssessment,
    CourseAssessmentQuestion,
)


# Correct answer index:
# 0 = First option
# 1 = Second option
# 2 = Third option
# 3 = Fourth option

COURSE_QUESTION_BANK = {

    "Python Programming": [
        (
            "Which keyword is used to define a function in Python?",
            ["function", "def", "fun", "define"],
            1,
            "The def keyword is used to define a function."
        ),
        (
            "Which data type stores an ordered and changeable collection?",
            ["Tuple", "Set", "List", "String"],
            2,
            "A list is ordered and mutable."
        ),
        (
            "What is the output of len('Python')?",
            ["5", "6", "7", "8"],
            1,
            "Python contains six characters."
        ),
        (
            "Which symbol is used for single-line comments in Python?",
            ["//", "/*", "#", "--"],
            2,
            "The hash symbol starts a single-line comment."
        ),
        (
            "Which data type stores key-value pairs?",
            ["List", "Tuple", "Dictionary", "Set"],
            2,
            "A dictionary stores data as key-value pairs."
        ),
        (
            "Which statement handles exceptions?",
            ["if-else", "try-except", "for-in", "def-return"],
            1,
            "try-except handles runtime exceptions."
        ),
        (
            "What does the range(5) function generate?",
            ["1 to 5", "0 to 5", "0 to 4", "1 to 4"],
            2,
            "range(5) generates values from 0 through 4."
        ),
        (
            "Which keyword is used to create a class?",
            ["object", "class", "struct", "new"],
            1,
            "The class keyword defines a class in Python."
        ),
        (
            "Which operator is used for exponentiation?",
            ["^", "**", "//", "%"],
            1,
            "The double asterisk operator performs exponentiation."
        ),
        (
            "Which library is commonly used for numerical arrays?",
            ["NumPy", "Flask", "Django", "Tkinter"],
            0,
            "NumPy provides support for numerical arrays."
        ),
    ],

    "Java Programming": [
        (
            "Which method is the entry point of a Java application?",
            ["start()", "run()", "main()", "execute()"],
            2,
            "The main method is the standard entry point."
        ),
        (
            "Which keyword is used to create an object in Java?",
            ["class", "this", "new", "static"],
            2,
            "The new keyword creates an object."
        ),
        (
            "Which data type stores true or false?",
            ["int", "boolean", "char", "float"],
            1,
            "boolean stores true or false values."
        ),
        (
            "Which keyword prevents a class from being inherited?",
            ["static", "private", "final", "abstract"],
            2,
            "A final class cannot be extended."
        ),
        (
            "Which concept allows the same method name with different parameters?",
            ["Overriding", "Overloading", "Inheritance", "Encapsulation"],
            1,
            "Method overloading uses different parameter lists."
        ),
        (
            "Which collection does not allow duplicate elements?",
            ["ArrayList", "LinkedList", "HashSet", "Vector"],
            2,
            "HashSet stores unique elements."
        ),
        (
            "Which keyword is used for inheritance in Java classes?",
            ["implements", "extends", "inherits", "superclass"],
            1,
            "The extends keyword establishes class inheritance."
        ),
        (
            "Which block is commonly used to handle exceptions?",
            ["try-catch", "if-else", "switch-case", "for-loop"],
            0,
            "try-catch is used for exception handling."
        ),
        (
            "Which package contains the Scanner class?",
            ["java.io", "java.util", "java.net", "java.sql"],
            1,
            "Scanner belongs to the java.util package."
        ),
        (
            "What is JVM responsible for?",
            [
                "Designing user interfaces",
                "Executing Java bytecode",
                "Creating databases",
                "Writing source code"
            ],
            1,
            "The JVM executes Java bytecode."
        ),
    ],

    "C Programming": [
        (
            "Which function is the entry point of a C program?",
            ["start()", "main()", "init()", "run()"],
            1,
            "Execution of a standard C program starts at main()."
        ),
        (
            "Which header file is required for printf()?",
            ["stdlib.h", "string.h", "stdio.h", "math.h"],
            2,
            "printf() is declared in stdio.h."
        ),
        (
            "Which format specifier is used for an integer?",
            ["%f", "%c", "%d", "%s"],
            2,
            "%d is commonly used for int values."
        ),
        (
            "Which operator obtains the address of a variable?",
            ["*", "&", "%", "#"],
            1,
            "The address-of operator is &."
        ),
        (
            "Which loop executes its body at least once?",
            ["for", "while", "do-while", "nested for"],
            2,
            "A do-while loop checks its condition after execution."
        ),
        (
            "Which keyword declares a constant variable in C?",
            ["constant", "fixed", "const", "static"],
            2,
            "The const qualifier prevents modification through that variable."
        ),
        (
            "Which function is used to allocate memory dynamically?",
            ["printf()", "malloc()", "scanf()", "strlen()"],
            1,
            "malloc() allocates a block of memory dynamically."
        ),
        (
            "Array indexing in C normally starts at which value?",
            ["0", "1", "-1", "2"],
            0,
            "The first array element has index 0."
        ),
        (
            "Which statement exits a loop immediately?",
            ["continue", "return", "break", "goto"],
            2,
            "break terminates the nearest enclosing loop."
        ),
        (
            "Which operator accesses a structure member through a pointer?",
            [".", "->", "::", "&"],
            1,
            "The arrow operator accesses members through structure pointers."
        ),
    ],

    "C++ Programming": [
        (
            "Which feature allows a class to inherit another class?",
            ["Polymorphism", "Inheritance", "Abstraction", "Compilation"],
            1,
            "Inheritance allows a class to reuse another class's features."
        ),
        (
            "Which operator is used for scope resolution in C++?",
            [".", "->", "::", "&&"],
            2,
            "The scope resolution operator is ::."
        ),
        (
            "Which keyword creates an object dynamically?",
            ["malloc", "new", "create", "alloc"],
            1,
            "The new operator allocates an object dynamically."
        ),
        (
            "Which function has the same name as its class?",
            ["Destructor", "Constructor", "Friend function", "Virtual function"],
            1,
            "A constructor has the same name as its class."
        ),
        (
            "Which concept allows one interface with multiple implementations?",
            ["Encapsulation", "Polymorphism", "Compilation", "Iteration"],
            1,
            "Polymorphism allows different implementations through a common interface."
        ),
        (
            "Which access specifier allows access only within the class?",
            ["public", "protected", "private", "global"],
            2,
            "private members are accessible within the class and its friends."
        ),
        (
            "Which feature supports generic programming in C++?",
            ["Templates", "Namespaces", "Destructors", "Pointers"],
            0,
            "Templates support generic functions and classes."
        ),
        (
            "Which keyword is used to declare a virtual function?",
            ["virtual", "override", "static", "friend"],
            0,
            "The virtual keyword enables runtime polymorphism."
        ),
        (
            "Which standard library component stores dynamic sequences?",
            ["map", "vector", "stack", "queue"],
            1,
            "std::vector is a dynamically resizable sequence container."
        ),
        (
            "Which operator is used to access a member through a pointer?",
            [".", "->", "::", "!="],
            1,
            "The arrow operator accesses an object's member through a pointer."
        ),
    ],

    "SQL & Database Management": [
        (
            "Which SQL command retrieves data from a table?",
            ["INSERT", "UPDATE", "SELECT", "DELETE"],
            2,
            "SELECT retrieves records from database tables."
        ),
        (
            "Which clause filters rows before grouping?",
            ["ORDER BY", "WHERE", "HAVING", "GROUP BY"],
            1,
            "WHERE filters individual rows."
        ),
        (
            "Which key uniquely identifies each row in a table?",
            ["Foreign key", "Primary key", "Composite view", "Index only"],
            1,
            "A primary key uniquely identifies a record."
        ),
        (
            "Which SQL command adds new records?",
            ["ADD", "INSERT INTO", "CREATE", "ALTER"],
            1,
            "INSERT INTO adds rows to a table."
        ),
        (
            "Which clause groups rows with matching values?",
            ["GROUP BY", "ORDER BY", "WHERE", "LIMIT"],
            0,
            "GROUP BY groups rows for aggregate calculations."
        ),
        (
            "Which function counts rows?",
            ["SUM()", "AVG()", "COUNT()", "MAX()"],
            2,
            "COUNT() returns the number of rows or non-NULL values."
        ),
        (
            "Which JOIN returns matching rows from both tables?",
            ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "CROSS JOIN"],
            2,
            "INNER JOIN returns rows satisfying the join condition."
        ),
        (
            "Which command modifies existing records?",
            ["UPDATE", "INSERT", "CREATE", "DROP"],
            0,
            "UPDATE changes values in existing rows."
        ),
        (
            "What does a foreign key establish?",
            [
                "A relationship between tables",
                "A duplicate column",
                "A database backup",
                "A sorted result"
            ],
            0,
            "A foreign key establishes referential relationships between tables."
        ),
        (
            "Which ACID property ensures a transaction is all-or-nothing?",
            ["Consistency", "Isolation", "Atomicity", "Durability"],
            2,
            "Atomicity ensures that a transaction completes fully or not at all."
        ),
    ],

    "HTML & CSS": [
        ("Which HTML element defines the main heading?", ["<head>", "<h1>", "<title>", "<header>"], 1, "The h1 element represents the highest-level heading."),
        ("Which HTML attribute specifies an image location?", ["href", "src", "alt", "link"], 1, "The src attribute specifies the image source."),
        ("Which element creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1, "The anchor element creates hyperlinks."),
        ("Which CSS property changes text color?", ["font-style", "background", "color", "text-align"], 2, "The color property sets text color."),
        ("Which CSS selector targets an element by ID?", [".", "#", "*", "&"], 1, "The hash selector targets an element by ID."),
        ("Which CSS property controls space inside an element's border?", ["margin", "padding", "outline", "gap"], 1, "Padding is the space between content and border."),
        ("Which HTML element creates an unordered list?", ["<ol>", "<li>", "<ul>", "<dl>"], 2, "The ul element creates an unordered list."),
        ("Which CSS layout system is designed for one-dimensional layouts?", ["Grid", "Flexbox", "Float", "Position"], 1, "Flexbox is designed primarily for one-dimensional layouts."),
        ("Which HTML attribute provides alternative text for an image?", ["title", "src", "alt", "name"], 2, "The alt attribute provides alternative text."),
        ("Which CSS rule makes an element responsive to different screen sizes?", ["@media", "@font-face", "@import", "@keyframes"], 0, "Media queries apply styles based on device or viewport conditions."),
    ],

    "JavaScript Development": [
        ("Which keyword declares a block-scoped variable that can be reassigned?", ["var", "let", "const", "static"], 1, "let declares a reassignable block-scoped variable."),
        ("Which operator checks both value and type equality?", ["==", "=", "===", "!="], 2, "The strict equality operator checks value and type."),
        ("Which method converts a JSON string into a JavaScript object?", ["JSON.stringify()", "JSON.parse()", "Object.create()", "JSON.convert()"], 1, "JSON.parse() parses JSON text into a JavaScript value."),
        ("Which array method creates a new array by transforming elements?", ["filter()", "map()", "push()", "pop()"], 1, "map() transforms each element into a new array."),
        ("What does NaN represent?", ["New Array Number", "Not a Number", "Null and None", "Negative Number"], 1, "NaN means Not-a-Number."),
        ("Which keyword declares an asynchronous function?", ["await", "async", "promise", "defer"], 1, "The async keyword declares an asynchronous function."),
        ("Which method adds an element to the end of an array?", ["shift()", "unshift()", "push()", "slice()"], 2, "push() appends elements to an array."),
        ("Which browser API selects an element by its CSS selector?", ["document.querySelector()", "window.select()", "document.get()", "element.find()"], 0, "querySelector() returns the first matching element."),
        ("Which statement handles multiple conditions using cases?", ["for", "switch", "while", "try"], 1, "switch evaluates an expression against multiple case labels."),
        ("What does addEventListener() do?", ["Creates a variable", "Registers an event handler", "Deletes an element", "Loads a database"], 1, "addEventListener() registers a function to respond to an event."),
    ],

    "React.js Development": [
        ("What is React primarily used for?", ["Database management", "Building user interfaces", "Operating systems", "Network routing"], 1, "React is a library for building user interfaces."),
        ("Which hook manages local component state?", ["useEffect", "useState", "useRef", "useMemo"], 1, "useState adds state to function components."),
        ("What is JSX?", ["A database", "A JavaScript syntax extension", "A CSS framework", "A server"], 1, "JSX lets developers describe UI using HTML-like syntax in JavaScript."),
        ("Which prop is commonly used to uniquely identify list elements?", ["id", "key", "ref", "name"], 1, "React uses key to identify list elements across renders."),
        ("What is the purpose of useEffect?", ["Manage CSS", "Perform side effects", "Create routes", "Define classes"], 1, "useEffect synchronizes components with external systems."),
        ("How does a child component receive data from a parent?", ["Through props", "Through SQL", "Through CSS", "Through package.json"], 0, "Props pass data from parent components to children."),
        ("What does a controlled input use to manage its value?", ["Only HTML attributes", "React state", "A database trigger", "A CSS selector"], 1, "A controlled input receives its value from React state."),
        ("Which method is commonly used to render arrays of elements?", ["map()", "reduce()", "splice()", "sort()"], 0, "map() is commonly used to create elements from array data."),
        ("What is the Virtual DOM?", ["A physical server", "A lightweight representation of the UI", "A database table", "A CSS file"], 1, "React uses a virtual representation to calculate UI updates."),
        ("What does lifting state up mean?", ["Moving state to a common parent", "Deleting component state", "Moving CSS into HTML", "Installing React"], 0, "Lifting state up shares state through a common ancestor."),
    ],

    "Node.js Development": [
        ("What is Node.js?", ["A JavaScript runtime", "A database", "A CSS framework", "An HTML editor"], 0, "Node.js runs JavaScript outside the browser."),
        ("Which built-in module handles file system operations?", ["http", "fs", "path", "events"], 1, "The fs module provides file system functionality."),
        ("Which file commonly stores Node.js project dependencies and scripts?", ["index.html", "package.json", "config.css", "README.lock"], 1, "package.json stores project metadata, dependencies and scripts."),
        ("Which command initializes a Node.js project with default settings?", ["node start", "npm init -y", "npm install node", "node create"], 1, "npm init -y creates a default package.json."),
        ("What does Express.js provide?", ["A web application framework", "A database engine", "A programming language", "A browser"], 0, "Express is a web framework for Node.js."),
        ("Which object provides access to environment variables?", ["process.env", "window.env", "global.css", "node.config"], 0, "process.env exposes environment variables."),
        ("Which HTTP method is generally used to create a resource?", ["GET", "POST", "DELETE", "HEAD"], 1, "POST is commonly used to submit data and create resources."),
        ("What is middleware in Express?", ["A function in the request-response cycle", "A database table", "A CSS component", "A compiler"], 0, "Middleware functions can access and modify request and response objects."),
        ("Which keyword waits for a Promise inside an async function?", ["defer", "await", "yield", "return"], 1, "await pauses the async function until the Promise settles."),
        ("Which module helps create an HTTP server?", ["fs", "http", "crypto", "os"], 1, "The built-in http module can create HTTP servers."),
    ],

    "Django Web Development": [
        ("Which command creates a new Django project?", ["django-admin startproject", "django-admin startapp", "python manage.py runserver", "pip freeze"], 0, "startproject creates the Django project structure."),
        ("Which command creates a new Django application?", ["startproject", "startapp", "makemigrations", "collectstatic"], 1, "python manage.py startapp creates an application."),
        ("Where are Django database models usually defined?", ["views.py", "models.py", "urls.py", "admin.py"], 1, "models.py defines database models."),
        ("Which file commonly maps URL patterns to views?", ["settings.py", "urls.py", "apps.py", "tests.py"], 1, "urls.py contains URL routing configuration."),
        ("Which command creates migration files?", ["migrate", "makemigrations", "runserver", "createsuperuser"], 1, "makemigrations generates migration files from model changes."),
        ("Which command applies database migrations?", ["migrate", "startapp", "check", "shell"], 0, "migrate applies migrations to the database."),
        ("Which Django component handles incoming HTTP requests?", ["Model", "View", "Migration", "Template tag"], 1, "Views process requests and return responses."),
        ("Which setting lists enabled Django applications?", ["MIDDLEWARE", "INSTALLED_APPS", "DATABASES", "TEMPLATES"], 1, "INSTALLED_APPS contains the registered applications."),
        ("Which ORM method retrieves a single matching object or raises an exception?", ["filter()", "get()", "all()", "exclude()"], 1, "get() retrieves one matching object and raises an exception if it cannot find exactly one."),
        ("What is Django REST Framework primarily used for?", ["Building REST APIs", "Editing images", "Managing CSS", "Compiling Python"], 0, "Django REST Framework provides tools for building Web APIs."),
    ],

    "Data Analytics": [
        ("Which measure represents the average of a dataset?", ["Median", "Mode", "Mean", "Range"], 2, "Mean is calculated by dividing the sum by the number of values."),
        ("Which chart is best for showing trends over time?", ["Pie chart", "Line chart", "Donut chart", "Tree map"], 1, "Line charts show changes and trends over time."),
        ("What does data cleaning involve?", ["Deleting all records", "Correcting errors and inconsistencies", "Creating animations", "Changing file extensions"], 1, "Data cleaning improves data quality by handling errors and inconsistencies."),
        ("Which Excel function calculates an average?", ["SUM()", "COUNT()", "AVERAGE()", "MAX()"], 2, "AVERAGE() calculates the arithmetic mean."),
        ("What is an outlier?", ["A repeated value", "An unusually distant observation", "The most frequent value", "A column name"], 1, "An outlier differs substantially from other observations."),
        ("Which SQL clause filters grouped results?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 1, "HAVING filters groups after aggregation."),
        ("What does KPI stand for?", ["Key Performance Indicator", "Known Processing Input", "Key Program Integration", "Knowledge Performance Index"], 0, "KPI stands for Key Performance Indicator."),
        ("Which technique summarizes data using minimum, maximum, and quartiles?", ["Regression", "Five-number summary", "Classification", "Clustering"], 1, "A five-number summary includes minimum, Q1, median, Q3 and maximum."),
        ("What is data visualization?", ["Encrypting data", "Representing data graphically", "Deleting data", "Compressing files"], 1, "Data visualization communicates information through visual representations."),
        ("Which statistical measure is less affected by extreme values?", ["Mean", "Median", "Variance", "Standard deviation"], 1, "Median is generally more robust to extreme values than mean."),
    ],

    "Data Science": [
        ("Which programming language is widely used in data science?", ["Python", "HTML", "CSS", "XML"], 0, "Python is widely used for data science."),
        ("What is supervised learning?", ["Learning without labels", "Learning from labeled examples", "Learning only by clustering", "Learning without data"], 1, "Supervised learning uses labeled training data."),
        ("Which library is commonly used for tabular data manipulation in Python?", ["Pandas", "Flask", "Pygame", "Tkinter"], 0, "Pandas provides DataFrame tools for tabular data."),
        ("What does a training dataset do?", ["Tests only the final model", "Fits the model parameters", "Stores passwords", "Creates visual themes"], 1, "Training data is used to fit a machine learning model."),
        ("What is overfitting?", ["Model performs well on unseen data", "Model memorizes training data and generalizes poorly", "Model has no parameters", "Model cannot read data"], 1, "Overfitting occurs when a model captures training-specific noise."),
        ("Which metric is the ratio of correct predictions to total predictions?", ["Recall", "Precision", "Accuracy", "F1 only"], 2, "Accuracy is the proportion of correct predictions."),
        ("What is feature engineering?", ["Creating or transforming model input variables", "Deleting the target variable", "Deploying a website", "Formatting a document"], 0, "Feature engineering prepares useful input features for models."),
        ("Which technique reduces the number of features?", ["Dimensionality reduction", "Data duplication", "Sorting", "Tokenization only"], 0, "Dimensionality reduction represents data using fewer dimensions."),
        ("What is the purpose of a test dataset?", ["Train the model repeatedly", "Evaluate model performance on held-out data", "Replace all features", "Create database tables"], 1, "A test set estimates generalization on unseen data."),
        ("Which task predicts a continuous numerical value?", ["Classification", "Regression", "Clustering", "Association mining"], 1, "Regression predicts continuous numerical outcomes."),
    ],

    "Power BI": [
        ("What is Power BI primarily used for?", ["Database administration only", "Business intelligence and visualization", "Operating system development", "Video editing"], 1, "Power BI creates interactive reports and dashboards."),
        ("Which language is used for Power BI measures?", ["DAX", "Java", "C", "HTML"], 0, "DAX is used for calculations and measures in Power BI."),
        ("What is Power Query used for?", ["Data transformation and preparation", "Writing CSS", "Managing computer hardware", "Creating operating systems"], 0, "Power Query extracts and transforms data."),
        ("Which Power BI view is used to manage table relationships?", ["Report view", "Model view", "Reading view", "Mobile view"], 1, "Model view displays tables and their relationships."),
        ("Which DAX function adds values in a column?", ["COUNTROWS()", "SUM()", "AVERAGE()", "RELATED()"], 1, "SUM() adds the values in a column."),
        ("What is a slicer in Power BI?", ["A visual filter control", "A database backup", "A programming language", "A report export format"], 0, "A slicer lets users filter report data interactively."),
        ("What does a one-to-many relationship mean?", ["One row relates to multiple rows in another table", "All tables are identical", "No table has a key", "Only one table exists"], 0, "One record on one side can relate to multiple records on the other."),
        ("Which visual is suitable for comparing categories?", ["Bar chart", "Gauge only", "Map only", "Card only"], 0, "Bar charts compare values across categories."),
        ("What is Power BI Service?", ["Cloud-based Power BI platform", "A desktop operating system", "A SQL data type", "A Python package"], 0, "Power BI Service supports publishing and sharing reports online."),
        ("What is a dashboard in Power BI?", ["A single-page collection of pinned visuals", "A raw CSV file", "A programming compiler", "A database index"], 0, "A dashboard combines pinned visuals on one page."),
    ],

    "Machine Learning": [
        ("What is machine learning?", ["A method that enables systems to learn patterns from data", "A type of HTML", "A database engine", "A computer network cable"], 0, "Machine learning learns patterns from data."),
        ("Which algorithm is commonly used for classification?", ["Linear Regression", "Decision Tree", "K-means only", "PCA"], 1, "Decision trees can be used for classification."),
        ("What is the purpose of a validation dataset?", ["Tune and compare model configurations", "Store source code", "Replace training data", "Encrypt labels"], 0, "Validation data helps tune model choices."),
        ("Which learning approach uses unlabeled data?", ["Supervised", "Unsupervised", "Reinforcement only", "Transfer only"], 1, "Unsupervised learning discovers patterns without target labels."),
        ("What does K-means do?", ["Classification using labels", "Groups data into clusters", "Predicts exact text", "Sorts SQL tables"], 1, "K-means partitions observations into clusters."),
        ("What is a confusion matrix used for?", ["Evaluating classification predictions", "Compressing datasets", "Writing functions", "Creating indexes"], 0, "A confusion matrix compares actual and predicted classes."),
        ("What is regularization?", ["A technique to reduce overfitting", "A way to duplicate data", "A chart type", "A database constraint"], 0, "Regularization penalizes overly complex model parameters."),
        ("Which metric is the harmonic mean of precision and recall?", ["Accuracy", "F1-score", "MSE", "R-squared"], 1, "F1-score is the harmonic mean of precision and recall."),
        ("What does a learning rate control?", ["The step size of parameter updates", "The dataset size", "The number of labels", "The file format"], 0, "Learning rate controls how much model parameters change per update."),
        ("Which method combines multiple models to improve performance?", ["Ensemble learning", "Data deletion", "Normalization only", "Tokenization"], 0, "Ensemble methods combine predictions from multiple models."),
    ],

    "Deep Learning": [
        ("What is the basic computational unit of an artificial neural network?", ["Neuron", "Database", "Router", "Compiler"], 0, "Artificial neurons process weighted inputs and activations."),
        ("Which function introduces non-linearity in a neural network?", ["ReLU", "SUM", "COUNT", "JOIN"], 0, "ReLU is a commonly used activation function."),
        ("What is backpropagation used for?", ["Calculating gradients for parameter updates", "Loading images", "Creating database tables", "Sorting classes"], 0, "Backpropagation computes gradients through the network."),
        ("Which architecture is commonly used for image processing?", ["CNN", "RNN only", "Decision Tree", "Linear Regression"], 0, "Convolutional Neural Networks are widely used for image tasks."),
        ("What does an epoch represent?", ["One complete pass through the training dataset", "One neuron", "One prediction", "One database query"], 0, "An epoch is one full pass over the training data."),
        ("Which optimizer uses adaptive estimates of first and second moments?", ["Adam", "K-means", "Naive Bayes", "PCA"], 0, "Adam adapts learning rates using moment estimates."),
        ("What problem do recurrent neural networks address?", ["Sequential data", "Only static images", "Database normalization", "CSS rendering"], 0, "RNNs are designed to process sequential information."),
        ("What is dropout used for?", ["Reducing overfitting", "Increasing duplicate records", "Removing labels permanently", "Converting images to text"], 0, "Dropout randomly disables units during training to regularize the model."),
        ("What does a loss function measure?", ["Prediction error", "File size", "Network speed only", "Number of columns"], 0, "A loss function quantifies the model's prediction error."),
        ("Which architecture uses self-attention as a central mechanism?", ["Transformer", "Basic decision tree", "K-means", "Linear regression"], 0, "Transformers rely heavily on attention mechanisms."),
    ],

    "AWS Cloud Computing": [
        ("What does AWS stand for?", ["Amazon Web Services", "Advanced Web System", "Automated Web Software", "Amazon Wide Storage"], 0, "AWS stands for Amazon Web Services."),
        ("Which AWS service provides virtual servers?", ["S3", "EC2", "RDS", "CloudFront"], 1, "Amazon EC2 provides resizable virtual compute instances."),
        ("Which AWS service is used for object storage?", ["EC2", "Lambda", "S3", "VPC"], 2, "Amazon S3 is an object storage service."),
        ("What is AWS IAM used for?", ["Managing identities and permissions", "Creating virtual machines", "Storing images", "Monitoring CPU temperature"], 0, "IAM manages users, roles, policies and permissions."),
        ("Which AWS service provides managed relational databases?", ["RDS", "S3", "Route 53", "CloudWatch"], 0, "Amazon RDS provides managed relational database services."),
        ("What does AWS Lambda provide?", ["Serverless code execution", "Physical server maintenance", "Object storage", "DNS registration"], 0, "Lambda runs code in response to events without managing servers."),
        ("Which service monitors AWS resources and metrics?", ["CloudWatch", "IAM", "S3", "EBS"], 0, "CloudWatch collects metrics, logs and monitoring information."),
        ("What is an Availability Zone?", ["An isolated location within an AWS Region", "A programming language", "A database table", "A billing account"], 0, "Availability Zones are isolated locations within a Region."),
        ("Which AWS service distributes incoming application traffic?", ["Elastic Load Balancing", "S3 Glacier", "IAM", "CloudTrail"], 0, "Elastic Load Balancing distributes traffic across targets."),
        ("What is an AWS VPC?", ["A logically isolated virtual network", "A file compression format", "A database query", "An email service"], 0, "A VPC provides a logically isolated network in AWS."),
    ],

    "Microsoft Azure": [
        ("What is Microsoft Azure?", ["A cloud computing platform", "A programming language", "A database query language", "A desktop editor"], 0, "Azure is Microsoft's cloud computing platform."),
        ("Which Azure service provides virtual machines?", ["Azure Virtual Machines", "Azure Blob Storage", "Azure DNS", "Azure DevOps Boards"], 0, "Azure Virtual Machines provides scalable virtual computing."),
        ("Which Azure service is designed for object storage?", ["Azure Functions", "Blob Storage", "Azure Monitor", "Azure SQL only"], 1, "Azure Blob Storage stores unstructured object data."),
        ("What is Microsoft Entra ID used for?", ["Identity and access management", "Image editing", "Container building", "File compression"], 0, "Microsoft Entra ID provides identity and access management."),
        ("Which Azure service provides managed relational databases?", ["Azure SQL Database", "Azure CDN", "Azure Front Door", "Azure Monitor"], 0, "Azure SQL Database is a managed relational database service."),
        ("What does Azure Functions support?", ["Serverless event-driven code", "Only physical servers", "Manual spreadsheet formatting", "Network cabling"], 0, "Azure Functions runs event-driven code without managing infrastructure."),
        ("Which Azure service monitors applications and infrastructure?", ["Azure Monitor", "Azure DNS", "Blob Storage", "Key Vault"], 0, "Azure Monitor collects and analyzes monitoring data."),
        ("What is an Azure Resource Group?", ["A logical container for related resources", "A programming framework", "A virtual machine processor", "A database column"], 0, "Resource groups organize related Azure resources."),
        ("Which service helps store and manage application secrets?", ["Azure Key Vault", "Azure CDN", "Azure Load Balancer", "Azure Queue Storage"], 0, "Key Vault securely stores keys, secrets and certificates."),
        ("What is an Azure Region?", ["A geographical area containing datacenters", "A programming variable", "A database index", "A virtual network protocol"], 0, "An Azure Region is a geographical area containing datacenters."),
    ],

    "DevOps & Docker": [
        ("What does DevOps combine?", ["Development and Operations", "Design and Photography", "Database and Hardware", "Testing and Marketing only"], 0, "DevOps combines development and IT operations practices."),
        ("What is Docker primarily used for?", ["Containerization", "Image editing", "Database normalization", "Writing CSS"], 0, "Docker packages applications and dependencies into containers."),
        ("What is a Docker image?", ["A template used to create containers", "A running container only", "A physical server", "A network cable"], 0, "A Docker image is a read-only template for creating containers."),
        ("Which command builds a Docker image?", ["docker build", "docker start", "docker pull", "docker logs"], 0, "docker build creates an image from a build context."),
        ("Which command lists running Docker containers?", ["docker images", "docker ps", "docker build", "docker login"], 1, "docker ps lists running containers by default."),
        ("What does CI stand for?", ["Continuous Integration", "Container Installation", "Code Inspection", "Central Interface"], 0, "CI stands for Continuous Integration."),
        ("What does CD commonly represent in CI/CD?", ["Continuous Delivery or Deployment", "Code Deletion", "Container Design", "Central Database"], 0, "CD commonly refers to Continuous Delivery or Continuous Deployment."),
        ("What is a Docker volume used for?", ["Persistent data storage", "Building CSS layouts", "Creating network addresses", "Compiling source code"], 0, "Volumes persist data beyond a container's lifecycle."),
        ("Which Docker file defines instructions to build an image?", ["Dockerfile", "package.json", "index.html", "requirements.lock"], 0, "A Dockerfile contains image build instructions."),
        ("What is container orchestration used for?", ["Managing and scaling containers", "Editing images", "Writing SQL queries", "Designing user interfaces"], 0, "Container orchestration automates deployment, scaling and management."),
    ],

    "Cybersecurity Fundamentals": [
        ("What is the primary goal of cybersecurity?", ["Protecting systems and information", "Increasing screen brightness", "Designing websites", "Compressing files"], 0, "Cybersecurity protects systems, networks and information."),
        ("What does the CIA triad stand for?", ["Confidentiality, Integrity, Availability", "Control, Internet, Access", "Computer, Information, Application", "Cybersecurity, Identity, Authentication"], 0, "The CIA triad represents three core security principles."),
        ("What is phishing?", ["A fraudulent attempt to obtain sensitive information", "A database backup", "A software update", "A network cable failure"], 0, "Phishing uses deceptive messages to steal sensitive information."),
        ("What is multi-factor authentication?", ["Using two or more verification factors", "Using only a username", "Sharing one password", "Disabling account security"], 0, "MFA requires multiple independent verification factors."),
        ("What does encryption do?", ["Transforms data into an unreadable form without the key", "Deletes all files", "Increases network speed", "Creates user interfaces"], 0, "Encryption protects information by converting it into ciphertext."),
        ("What is a firewall used for?", ["Controlling network traffic", "Editing documents", "Creating databases", "Installing operating systems"], 0, "Firewalls filter network traffic based on security rules."),
        ("What is malware?", ["Malicious software", "A secure backup", "A network standard", "A database index"], 0, "Malware is software designed to harm or compromise systems."),
        ("Why are software security updates important?", ["They fix vulnerabilities and bugs", "They remove all user accounts", "They disable encryption", "They replace hardware"], 0, "Security updates address known vulnerabilities."),
        ("What is the principle of least privilege?", ["Give users only the access they need", "Give everyone administrator access", "Share all passwords", "Disable access controls"], 0, "Least privilege limits permissions to the minimum necessary."),
        ("What is a security vulnerability?", ["A weakness that could be exploited", "A verified backup", "A secure password", "A network monitoring report"], 0, "A vulnerability is a weakness that may be exploited by a threat."),
    ],

    "Ethical Hacking": [
        ("What is ethical hacking?", ["Authorized security testing", "Unauthorized system access", "Data theft", "Disabling security controls without permission"], 0, "Ethical hacking tests security with proper authorization."),
        ("What is the first important requirement before penetration testing?", ["Written authorization and defined scope", "Deleting system logs", "Sharing administrator passwords", "Disabling all backups"], 0, "Testing must be authorized and limited to an agreed scope."),
        ("What is reconnaissance in security testing?", ["Collecting information about the target", "Deleting databases", "Installing applications", "Writing user documentation"], 0, "Reconnaissance gathers information about an authorized target."),
        ("What does vulnerability assessment identify?", ["Potential security weaknesses", "Employee salaries", "Website color schemes", "Database storage costs"], 0, "Vulnerability assessment identifies and evaluates security weaknesses."),
        ("What is penetration testing?", ["A controlled attempt to evaluate security", "A routine file backup", "A software design method", "A database migration"], 0, "Penetration testing simulates attacks under authorized conditions."),
        ("What is the purpose of a security patch?", ["Fixing known vulnerabilities", "Creating duplicate accounts", "Removing audit records", "Increasing file size"], 0, "Security patches correct known software weaknesses."),
        ("What does OWASP Top 10 describe?", ["Major web application security risks", "Top programming languages", "Cloud pricing plans", "Database backup formats"], 0, "OWASP Top 10 highlights important web application security risks."),
        ("What is SQL injection?", ["Manipulating database queries through unsafe input", "Encrypting database backups", "Creating a new database", "Compressing SQL files"], 0, "SQL injection exploits unsafe handling of database input."),
        ("Why is responsible disclosure important?", ["It allows vulnerabilities to be reported and fixed safely", "It publishes passwords publicly", "It encourages unauthorized access", "It deletes evidence"], 0, "Responsible disclosure gives maintainers an opportunity to address vulnerabilities."),
        ("What should a penetration testing report include?", ["Findings, impact and remediation guidance", "Only personal opinions", "User passwords", "Unrelated source code"], 0, "A useful report documents risks and actionable remediation."),
    ],

    "MySQL Database": [
        ("What is MySQL?", ["Relational database management system", "Programming language", "Web browser", "Operating system"], 0, "MySQL is a relational database management system."),
        ("Which language is used to query MySQL?", ["HTML", "SQL", "CSS", "Python only"], 1, "SQL is used to query and manage relational databases."),
        ("Which command retrieves data from a table?", ["GET", "SELECT", "FETCHFILE", "OPEN"], 1, "SELECT retrieves rows from a database table."),
        ("Which clause filters rows?", ["ORDER BY", "GROUP BY", "WHERE", "JOIN"], 2, "WHERE filters rows based on a condition."),
        ("What is a primary key?", ["A unique identifier for a row", "A duplicate column", "A backup file", "A database password"], 0, "A primary key uniquely identifies each row."),
        ("Which command adds a new row?", ["INSERT INTO", "UPDATE", "ALTER", "DROP"], 0, "INSERT INTO adds records to a table."),
        ("Which command modifies existing rows?", ["CREATE", "UPDATE", "SELECT", "SHOW"], 1, "UPDATE changes existing records."),
        ("What does a FOREIGN KEY do?", ["Links related tables", "Deletes all records", "Encrypts a database", "Creates a backup"], 0, "A foreign key establishes a relationship between tables."),
        ("Which clause sorts query results?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 2, "ORDER BY sorts the returned rows."),
        ("What does COMMIT do in a transaction?", ["Permanently saves transaction changes", "Deletes a table", "Creates a database user", "Sorts records"], 0, "COMMIT makes transaction changes permanent."),
    ],

    "MongoDB": [
        ("What type of database is MongoDB?", ["Relational", "Document-oriented NoSQL", "Graph-only", "Spreadsheet"], 1, "MongoDB is a document-oriented NoSQL database."),
        ("Which format represents MongoDB documents?", ["BSON", "HTML", "CSV only", "XML only"], 0, "MongoDB stores documents using BSON, a binary JSON-like format."),
        ("What is a collection in MongoDB?", ["A group of documents", "A single database server", "A programming function", "A network connection"], 0, "A collection stores related documents."),
        ("Which method retrieves documents?", ["find()", "insertOne()", "deleteOne()", "updateOne()"], 0, "find() retrieves documents matching a query."),
        ("Which method inserts one document?", ["findOne()", "insertOne()", "drop()", "aggregate()"], 1, "insertOne() inserts a single document."),
        ("What is the default unique identifier field?", ["_id", "_key", "id_num", "primary"], 0, "MongoDB documents normally have a unique _id field."),
        ("Which method updates one matching document?", ["updateOne()", "find()", "insertMany()", "countDocuments()"], 0, "updateOne() updates one document matching a filter."),
        ("Which operator is commonly used to match values greater than a given value?", ["$lt", "$gt", "$eq", "$in"], 1, "$gt matches values greater than the specified value."),
        ("What does aggregation provide?", ["Data processing and transformation pipelines", "Only user authentication", "Image compression", "Operating system updates"], 0, "Aggregation pipelines process and transform documents."),
        ("What is an index used for in MongoDB?", ["Improving query performance", "Deleting collections automatically", "Encrypting every document", "Replacing the database"], 0, "Indexes can improve the efficiency of queries."),
    ],

    "Full Stack Web Development": [
        ("What does full stack development involve?", ["Frontend and backend development", "Only graphic design", "Only database administration", "Only testing"], 0, "Full stack development covers both client-side and server-side work."),
        ("Which technology structures web page content?", ["HTML", "SQL", "Docker", "Git"], 0, "HTML defines the structure and content of web pages."),
        ("Which technology styles web pages?", ["Python", "CSS", "MySQL", "Django ORM"], 1, "CSS controls presentation and layout."),
        ("What is JavaScript commonly used for in frontend development?", ["Adding interactivity", "Managing physical servers", "Replacing HTML completely", "Creating database backups"], 0, "JavaScript adds behavior and interactivity to web pages."),
        ("What is an API?", ["An interface for software communication", "A CSS selector", "A database table", "A web image format"], 0, "An API defines how software components communicate."),
        ("What does REST commonly use to exchange data?", ["HTTP", "Bluetooth only", "FTP only", "HDMI"], 0, "REST APIs commonly use HTTP methods and JSON representations."),
        ("What is the purpose of a backend?", ["Handling server-side logic and data", "Styling buttons only", "Displaying images only", "Editing browser bookmarks"], 0, "The backend handles application logic, data access and server operations."),
        ("Which HTTP method is commonly used to create a resource?", ["GET", "POST", "DELETE", "HEAD"], 1, "POST is commonly used to submit data and create resources."),
        ("What is authentication?", ["Verifying a user's identity", "Changing a page color", "Sorting database rows", "Compressing an image"], 0, "Authentication verifies who a user is."),
        ("Why is database integration needed in a web application?", ["To store and retrieve application data", "To style the navigation bar", "To replace the browser", "To create animations"], 0, "Database integration allows applications to persist and access data."),
    ],

    "Git & GitHub": [
        ("What is Git?", ["A distributed version control system", "A programming language", "A web browser", "A database engine"], 0, "Git tracks changes to files and supports collaborative development."),
        ("What is GitHub?", ["A platform for hosting and collaborating on Git repositories", "A replacement for HTML", "A database query language", "An operating system"], 0, "GitHub hosts Git repositories and collaboration workflows."),
        ("Which command initializes a Git repository?", ["git start", "git init", "git create", "git open"], 1, "git init creates a new local Git repository."),
        ("Which command checks the working tree status?", ["git status", "git push", "git clone", "git merge"], 0, "git status displays the state of the working tree."),
        ("Which command stages changes?", ["git add", "git remove", "git branch", "git log"], 0, "git add stages changes for the next commit."),
        ("Which command records staged changes?", ["git commit", "git fetch", "git pull", "git diff"], 0, "git commit records staged changes in repository history."),
        ("What does git clone do?", ["Copies a remote repository locally", "Deletes a branch", "Publishes a release automatically", "Resets a password"], 0, "git clone creates a local copy of a remote repository."),
        ("Which command sends local commits to a remote repository?", ["git push", "git status", "git init", "git stash"], 0, "git push uploads local commits to a remote repository."),
        ("What is a Git branch?", ["An independent line of development", "A database backup", "A file extension", "A programming variable"], 0, "Branches allow work to progress independently."),
        ("What is a merge conflict?", ["An incompatible change that needs manual resolution", "A successful backup", "A new repository", "A deleted Git account"], 0, "Merge conflicts occur when Git cannot automatically reconcile changes."),
    ],

    "Software Testing": [
        ("What is software testing?", ["Evaluating software to find defects", "Writing marketing content", "Designing computer hardware", "Managing employee payroll"], 0, "Testing evaluates whether software behaves as expected."),
        ("What is unit testing?", ["Testing individual components", "Testing an entire organization", "Testing network cables", "Testing only user documentation"], 0, "Unit testing checks small, isolated pieces of code."),
        ("What is integration testing?", ["Testing interactions between components", "Testing only button colors", "Testing hardware temperature", "Testing employee access cards"], 0, "Integration testing verifies that components work together."),
        ("What is system testing?", ["Testing the complete integrated system", "Testing one variable only", "Testing a single SQL keyword", "Testing source code formatting only"], 0, "System testing evaluates the complete application."),
        ("What is regression testing?", ["Checking that changes have not broken existing functionality", "Testing only new hardware", "Removing old test cases", "Checking internet speed"], 0, "Regression testing detects unintended effects of changes."),
        ("What is a test case?", ["A set of steps, inputs and expected results", "A database server", "A programming language", "A user account"], 0, "A test case defines how to verify a specific behavior."),
        ("What is black-box testing?", ["Testing behavior without examining internal code", "Testing only source code syntax", "Testing database hardware", "Testing network cables"], 0, "Black-box testing focuses on inputs and observable outputs."),
        ("What is white-box testing?", ["Testing with knowledge of internal code structure", "Testing without any requirements", "Testing only the user interface", "Testing internet connectivity"], 0, "White-box testing considers the internal implementation."),
        ("What is a bug report?", ["A record describing a defect and how to reproduce it", "A software license", "A database schema", "A deployment server"], 0, "A bug report documents a defect, its impact and reproduction steps."),
        ("What is the purpose of acceptance testing?", ["Checking whether requirements are satisfied for acceptance", "Measuring CPU temperature", "Creating source code backups", "Formatting database tables"], 0, "Acceptance testing evaluates whether the system meets acceptance criteria."),
    ],

    "Selenium Automation Testing": [
        ("What is Selenium used for?", ["Automating web browsers", "Managing relational databases", "Designing logos", "Editing videos"], 0, "Selenium automates interactions with web browsers."),
        ("Which Selenium component provides browser automation APIs?", ["WebDriver", "GridFS", "JDBC", "Django ORM"], 0, "Selenium WebDriver provides APIs to control browsers."),
        ("Which method opens a URL using Selenium WebDriver?", ["get()", "openPage()", "visitURL()", "loadSite()"], 0, "The WebDriver get() method navigates to a URL."),
        ("What is a locator in Selenium?", ["A way to identify web elements", "A database backup", "A browser theme", "A programming language"], 0, "Locators identify elements on a web page."),
        ("Which locator uses an element's HTML id attribute?", ["By.ID", "By.CLASS", "By.TEXTONLY", "By.PAGE"], 0, "By.ID locates an element using its id attribute."),
        ("What is an explicit wait?", ["Waiting for a specific condition", "Waiting for a fixed time in every situation", "Closing the browser", "Deleting cookies"], 0, "Explicit waits wait until a specified condition is met or times out."),
        ("Which method clicks a web element?", ["click()", "pressURL()", "selectPage()", "openBrowser()"], 0, "The WebElement click() method clicks an element."),
        ("What is Page Object Model?", ["A design pattern that separates page locators and actions", "A database engine", "A browser protocol", "A CSS framework"], 0, "Page Object Model organizes page-specific locators and interactions."),
        ("What does Selenium Grid support?", ["Running tests across multiple machines and browser environments", "Creating database tables", "Editing screenshots only", "Writing HTML automatically"], 0, "Selenium Grid enables distributed and parallel test execution."),
        ("Why should automated tests use stable locators?", ["To reduce test failures caused by changing page structure", "To increase image resolution", "To delete browser history", "To disable assertions"], 0, "Stable locators make automated tests more reliable."),
    ],

    "UI/UX Design with Figma": [
        ("What does UI stand for?", ["User Interface", "Universal Internet", "User Installation", "Unified Input"], 0, "UI stands for User Interface."),
        ("What does UX stand for?", ["User Experience", "Universal Extension", "User Execution", "Unified Export"], 0, "UX stands for User Experience."),
        ("What is Figma primarily used for?", ["Interface design and prototyping", "Database administration", "Server hosting", "Video encoding"], 0, "Figma is a collaborative interface design and prototyping tool."),
        ("What is a frame in Figma?", ["A container for design elements", "A database record", "A programming loop", "A browser extension"], 0, "Frames organize design content and can represent screens or components."),
        ("What is a component in Figma?", ["A reusable design element", "A database password", "A network protocol", "A text editor"], 0, "Components enable reusable design elements."),
        ("What is an instance in Figma?", ["A linked copy of a component", "A new operating system", "A CSS file", "A browser tab"], 0, "Instances are copies connected to their main component."),
        ("What is a prototype used for?", ["Demonstrating interactions and user flows", "Storing database records", "Compiling source code", "Compressing images"], 0, "Prototypes demonstrate how users move through an interface."),
        ("What does Auto Layout help with?", ["Automatically arranging and spacing elements", "Encrypting design files", "Creating database indexes", "Managing server logs"], 0, "Auto Layout helps create responsive layouts with controlled spacing."),
        ("What is a design system?", ["A collection of reusable styles, components and guidelines", "A computer operating system", "A database backup plan", "A testing framework"], 0, "Design systems provide consistent reusable design rules and assets."),
        ("Why is a user flow created?", ["To map the steps a user takes to complete a task", "To measure server temperature", "To create SQL queries", "To compress a prototype"], 0, "User flows show the path users follow through a product."),
    ],

    "Android App Development": [
        ("Which operating system is Android based on?", ["Linux kernel", "Windows kernel", "DOS", "Solaris only"], 0, "Android uses a Linux-based kernel."),
        ("Which languages are officially supported for Android development?", ["Kotlin and Java", "HTML and CSS only", "SQL and XML only", "C and COBOL only"], 0, "Kotlin and Java are supported languages for Android development."),
        ("What is an Activity in Android?", ["A component representing a user-facing screen", "A database table", "A network cable", "An image format"], 0, "An Activity represents a screen or user interaction entry point."),
        ("What is an Android Intent used for?", ["Requesting an action from another app component", "Styling a button", "Creating a database index", "Compressing an image"], 0, "Intents communicate actions between Android components."),
        ("What is the AndroidManifest.xml file used for?", ["Declaring app components and essential app information", "Storing user photos only", "Writing SQL queries", "Defining CSS styles"], 0, "The manifest declares application components and required configuration."),
        ("What is an APK?", ["An Android application package", "A programming language", "A database engine", "A design framework"], 0, "APK is a package file format used to distribute Android apps."),
        ("What is the purpose of RecyclerView?", ["Efficiently displaying scrollable lists", "Managing passwords", "Creating network requests only", "Editing audio"], 0, "RecyclerView efficiently displays and recycles list item views."),
        ("What is Gradle used for in Android projects?", ["Build automation and dependency management", "Drawing icons only", "Managing phone contacts", "Encrypting messages"], 0, "Gradle automates builds and manages dependencies."),
        ("What is an emulator?", ["A virtual device for running and testing apps", "A physical database", "A source control system", "A design component"], 0, "An emulator simulates a device for development and testing."),
        ("What is an Android permission?", ["Authorization for access to protected resources", "A screen layout", "A database query", "A build file"], 0, "Permissions control access to protected device capabilities and data."),
    ],

    "Internet of Things (IoT)": [
        ("What does IoT stand for?", ["Internet of Things", "Integration of Technology", "Input of Tools", "Internet of Terminals"], 0, "IoT stands for Internet of Things."),
        ("What is an IoT device?", ["A physical device that can collect or exchange data", "A desktop wallpaper", "A database query", "A text document"], 0, "IoT devices connect physical objects to data and communication systems."),
        ("What is a sensor used for?", ["Measuring physical conditions", "Displaying web pages", "Compiling programs", "Managing source code"], 0, "Sensors measure conditions such as temperature, light or motion."),
        ("What is an actuator?", ["A component that performs a physical action", "A database index", "A programming language", "A network address"], 0, "Actuators convert control signals into physical actions."),
        ("Which protocol is commonly used for lightweight IoT messaging?", ["MQTT", "FTP", "SMTP only", "Telnet only"], 0, "MQTT is a lightweight publish-subscribe messaging protocol."),
        ("What does a microcontroller do?", ["Controls embedded electronic operations", "Hosts every website", "Replaces all cloud services", "Edits video files"], 0, "Microcontrollers execute programs to control embedded systems."),
        ("What is edge computing in IoT?", ["Processing data near the source", "Processing all data only in a distant cloud", "Deleting sensor data", "Replacing sensors with databases"], 0, "Edge computing processes data close to where it is generated."),
        ("Why is IoT security important?", ["Connected devices can expose data and systems to attacks", "It improves screen brightness", "It removes the need for updates", "It makes passwords public"], 0, "IoT security protects connected devices, networks and data."),
        ("What is a common IoT communication technology?", ["Wi-Fi", "HDMI", "VGA", "SATA"], 0, "Wi-Fi is commonly used for wireless IoT connectivity."),
        ("What is an IoT gateway used for?", ["Connecting devices and forwarding or processing their data", "Replacing every sensor", "Designing mobile app icons", "Printing source code"], 0, "An IoT gateway connects devices to networks or cloud services."),
    ],

    "Artificial Intelligence Fundamentals": [
        ("What is Artificial Intelligence?", ["The field of creating systems that perform tasks requiring human-like intelligence", "A database format", "A web styling language", "A computer cable"], 0, "AI develops systems that perform tasks associated with intelligence."),
        ("What is Machine Learning?", ["A subset of AI where systems learn patterns from data", "A type of monitor", "A database backup", "A network cable"], 0, "Machine Learning enables systems to learn patterns from data."),
        ("What is supervised learning?", ["Learning from labeled examples", "Learning without any data", "Only manually writing rules", "Deleting training data"], 0, "Supervised learning uses labeled input-output examples."),
        ("What is unsupervised learning?", ["Finding patterns in unlabeled data", "Training only on labeled answers", "Manually writing every prediction", "Running without input data"], 0, "Unsupervised learning discovers structure in unlabeled data."),
        ("What is a dataset?", ["A collection of data used for analysis or training", "A programming language", "A computer processor", "A network protocol"], 0, "A dataset is an organized collection of data."),
        ("What is a feature in Machine Learning?", ["An input variable used by a model", "The final report only", "A user password", "A database server"], 0, "Features are input variables used to make predictions."),
        ("What is a classification task?", ["Predicting a category or class", "Predicting only a continuous number", "Compressing a file", "Sorting folders alphabetically"], 0, "Classification predicts discrete categories."),
        ("What is regression in Machine Learning?", ["Predicting a continuous numerical value", "Predicting only image labels", "Deleting missing records", "Creating web layouts"], 0, "Regression estimates continuous numerical outcomes."),
        ("Why is a test dataset used?", ["To evaluate model performance on unseen data", "To train the model repeatedly only", "To store passwords", "To design an interface"], 0, "A test dataset evaluates how a model performs on unseen examples."),
        ("What is overfitting?", ["When a model learns training data too closely and generalizes poorly", "When a model has no parameters", "When data is encrypted", "When a dataset is deleted"], 0, "Overfitting occurs when a model performs well on training data but poorly on new data."),
    ],
}

class Command(BaseCommand):

    help = (
        "Seed course-specific final assessments "
        "and predefined MCQ questions."
    )

    def handle(self, *args, **options):

        created_assessments = 0
        updated_assessments = 0
        created_questions = 0
        updated_questions = 0
        skipped_courses = []

        self.stdout.write(
            self.style.NOTICE(
                "Starting Course Final Assessment seed..."
            )
        )

        with transaction.atomic():

            for course_name, questions in COURSE_QUESTION_BANK.items():

                course = Course.objects.filter(
                    name=course_name,
                    is_active=True
                ).first()

                if course is None:
                    skipped_courses.append(course_name)
                    continue

                assessment, created = CourseAssessment.objects.update_or_create(
                    course=course,
                    defaults={
                        "title": f"{course.name} - Final Assessment",
                        "description": (
                            f"Test your knowledge of {course.name} "
                            "through this course-specific assessment."
                        ),
                        "pass_percentage": 70,
                        "is_active": True,
                    }
                )

                if created:
                    created_assessments += 1
                else:
                    updated_assessments += 1

                for index, item in enumerate(questions, start=1):

                    question_text, choices, correct_index, explanation = item

                    if (
                        len(choices) != 4
                        or correct_index not in range(4)
                    ):
                        raise ValueError(
                            f"Invalid question data: {course.name}, "
                            f"question {index}"
                        )

                    question, question_created = (
                        CourseAssessmentQuestion.objects.update_or_create(
                            assessment=assessment,
                            order=index,
                            defaults={
                                "question": question_text,
                                "options": choices,
                                "correct_answer": correct_index,
                                "explanation": explanation,
                                "is_active": True,
                            }
                        )
                    )

                    if question_created:
                        created_questions += 1
                    else:
                        updated_questions += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Seeded: {course.name} "
                        f"({len(questions)} questions)"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"New assessments: {created_assessments}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Updated assessments: {updated_assessments}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"New questions: {created_questions}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Updated questions: {updated_questions}"
            )
        )

        if skipped_courses:
            self.stdout.write(
                self.style.WARNING(
                    "Courses not found or inactive: "
                    + ", ".join(skipped_courses)
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Course Final Assessment seed completed."
            )
        )
