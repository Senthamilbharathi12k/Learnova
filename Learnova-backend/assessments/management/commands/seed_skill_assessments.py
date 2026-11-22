
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from skills_interests.models import Skill
from assessments.models import AssessmentCategory, AssessmentQuestion


ASSESSMENTS = {
    "Angular": [
        ("What is Angular?", ["A JavaScript framework", "A database", "An operating system", "A programming language"], 0, "Angular is a TypeScript-based web application framework."),
        ("Which language is primarily used in Angular?", ["Python", "TypeScript", "Java", "C"], 1, "Angular applications primarily use TypeScript."),
        ("Which command creates a new Angular project?", ["ng new", "ng start", "npm create angular", "angular init"], 0, "The Angular CLI uses ng new to create projects."),
        ("What is a component in Angular?", ["A database table", "A reusable UI building block", "A server", "A CSS framework"], 1, "Components control a part of the user interface."),
        ("Which decorator defines an Angular component?", ["@Injectable", "@NgModule", "@Component", "@Pipe"], 2, "@Component provides metadata for an Angular component."),
        ("What is data binding?", ["Connecting data and the UI", "Deleting data", "Creating a database", "Installing packages"], 0, "Data binding synchronizes component data and the template."),
        ("Which symbol is used for property binding?", ["()", "[]", "{}", "#"], 1, "Square brackets are used for property binding."),
        ("Which directive conditionally displays an element?", ["*ngFor", "*ngIf", "ngClass", "ngStyle"], 1, "*ngIf conditionally renders template content."),
        ("What is dependency injection?", ["A testing framework", "A way to provide required services", "A CSS feature", "A database operation"], 1, "Dependency injection provides required dependencies to classes."),
        ("Which command runs an Angular development server?", ["ng serve", "ng build", "ng test", "ng deploy"], 0, "ng serve starts the local development server."),
    ],

    "AWS": [
        ("What does AWS stand for?", ["Amazon Web Services", "Advanced Web System", "Application Web Software", "Amazon Wide Storage"], 0, "AWS stands for Amazon Web Services."),
        ("Which AWS service provides virtual servers?", ["S3", "EC2", "RDS", "CloudFront"], 1, "Amazon EC2 provides resizable virtual compute instances."),
        ("Which service is used for object storage?", ["Lambda", "EC2", "S3", "VPC"], 2, "Amazon S3 is an object storage service."),
        ("What is AWS Lambda?", ["A database", "A serverless compute service", "A networking cable", "A monitoring dashboard"], 1, "Lambda runs code without requiring server management."),
        ("Which service manages relational databases?", ["Amazon RDS", "Amazon S3", "Amazon Route 53", "Amazon SNS"], 0, "Amazon RDS manages relational database engines."),
        ("What is an AWS Region?", ["A physical geographic area containing data centers", "A user password", "A storage file", "A programming language"], 0, "An AWS Region is a separate geographic area."),
        ("Which service helps deliver content globally?", ["CloudFront", "IAM", "DynamoDB", "CloudWatch"], 0, "CloudFront is AWS's content delivery network."),
        ("What does IAM manage?", ["Images", "Users and permissions", "Databases", "Website themes"], 1, "Identity and Access Management controls access to AWS resources."),
        ("Which AWS service monitors resources and metrics?", ["CloudWatch", "S3", "EC2", "Glue"], 0, "CloudWatch monitors AWS resources and applications."),
        ("What is an Availability Zone?", ["An isolated location within an AWS Region", "A programming tool", "A billing account", "A storage format"], 0, "Availability Zones are isolated locations within a Region."),
    ],

    "Azure": [
        ("What is Microsoft Azure?", ["A cloud computing platform", "A programming language", "A database query", "An operating system only"], 0, "Azure is Microsoft's cloud computing platform."),
        ("Which Azure service provides virtual machines?", ["Azure Blob Storage", "Azure Virtual Machines", "Azure DevOps", "Azure DNS"], 1, "Azure Virtual Machines provides cloud-based virtual servers."),
        ("Which service stores unstructured objects?", ["Azure Blob Storage", "Azure Functions", "Azure Monitor", "Azure Active Directory"], 0, "Blob Storage stores unstructured data such as files and images."),
        ("What is Azure Functions?", ["A serverless compute service", "A spreadsheet", "A database language", "A networking device"], 0, "Azure Functions runs event-driven code without managing servers."),
        ("Which service manages relational databases in Azure?", ["Azure SQL Database", "Blob Storage", "Azure CDN", "Azure DNS"], 0, "Azure SQL Database is a managed relational database service."),
        ("What is a Resource Group?", ["A container for related Azure resources", "A programming loop", "A virtual machine", "A user password"], 0, "Resource Groups organize and manage related Azure resources."),
        ("Which service helps manage application identities and access?", ["Microsoft Entra ID", "Azure Blob", "Azure Files", "Azure CDN"], 0, "Microsoft Entra ID provides identity and access management."),
        ("What is Azure DevOps used for?", ["Development collaboration and CI/CD", "Only image editing", "Hardware repair", "Database hosting only"], 0, "Azure DevOps supports planning, source control, builds, and releases."),
        ("Which Azure service monitors application performance?", ["Azure Monitor", "Azure Storage", "Azure DNS", "Azure Firewall"], 0, "Azure Monitor collects and analyzes monitoring data."),
        ("What is an Azure Region?", ["A geographic area containing Azure data centers", "A source-code file", "A database column", "A user role"], 0, "Azure Regions are geographic locations hosting cloud services."),
    ],

    "C": [
        ("Who developed the C programming language?", ["Dennis Ritchie", "James Gosling", "Bjarne Stroustrup", "Guido van Rossum"], 0, "Dennis Ritchie developed C at Bell Labs."),
        ("Which function is the usual entry point of a C program?", ["start()", "main()", "run()", "init()"], 1, "Execution of a standard C program begins in main()."),
        ("Which symbol ends a C statement?", [".", ":", ";", ","], 2, "A semicolon terminates most C statements."),
        ("Which format specifier prints an integer?", ["%f", "%c", "%d", "%s"], 2, "%d is commonly used to print an int."),
        ("Which header is needed for printf()?", ["stdlib.h", "stdio.h", "string.h", "math.h"], 1, "printf() is declared in stdio.h."),
        ("Which operator obtains a variable's address?", ["*", "&", "%", "#"], 1, "The address-of operator & returns a variable's address."),
        ("Which loop executes at least once?", ["for", "while", "do-while", "None"], 2, "A do-while loop checks its condition after executing the body."),
        ("What is an array?", ["A collection of same-type elements", "A single operator", "A function", "A compiler"], 0, "An array stores multiple elements of the same type."),
        ("Which keyword declares a constant variable?", ["constant", "fixed", "const", "staticvalue"], 2, "The const qualifier prevents modification through that variable."),
        ("Which function compares two strings?", ["strcpy()", "strcmp()", "strlen()", "strcat()"], 1, "strcmp() compares two strings lexicographically."),
    ],

    "C++": [
        ("Who designed C++?", ["Dennis Ritchie", "Bjarne Stroustrup", "James Gosling", "Anders Hejlsberg"], 1, "Bjarne Stroustrup created C++."),
        ("Which feature combines data and methods in a class?", ["Encapsulation", "Compilation", "Iteration", "Linking"], 0, "Encapsulation bundles data and methods and controls access."),
        ("Which keyword creates a class in C++?", ["structonly", "object", "class", "define"], 2, "The class keyword declares a class."),
        ("Which operator is used for scope resolution?", [".", "::", "->", "=>"], 1, "The :: operator identifies a scope such as a class or namespace."),
        ("Which function is called automatically when an object is created?", ["Destructor", "Constructor", "Main", "Operator"], 1, "A constructor initializes an object when it is created."),
        ("Which concept allows the same function name with different parameters?", ["Overloading", "Overriding", "Casting", "Recursion"], 0, "Function overloading uses the same name with different parameter lists."),
        ("Which keyword supports inheritance?", ["extends", "inherits", ":", "implements"], 2, "C++ uses a colon after the derived class name to specify its base class."),
        ("Which symbol accesses a member through a pointer?", [".", "::", "->", "&"], 2, "The arrow operator accesses members through a pointer."),
        ("Which feature allows runtime polymorphism?", ["Virtual functions", "Macros", "Header files", "Namespaces"], 0, "Virtual functions support dynamic dispatch in C++."),
        ("Which standard library container stores dynamic sequences?", ["vector", "printf", "scanf", "sizeof"], 0, "std::vector is a dynamic sequence container."),
    ],

    "CSS": [
        ("What does CSS stand for?", ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], 1, "CSS stands for Cascading Style Sheets."),
        ("Which property changes text color?", ["font-style", "background", "color", "text-align"], 2, "The color property sets the text color."),
        ("Which symbol selects an HTML element by ID?", [".", "#", "*", "&"], 1, "The # symbol is used for ID selectors."),
        ("Which property controls the space inside an element?", ["margin", "padding", "border", "outline"], 1, "Padding creates space between content and its border."),
        ("Which property controls the space outside an element?", ["padding", "margin", "width", "display"], 1, "Margin creates space outside an element's border."),
        ("Which CSS layout system is one-dimensional?", ["Grid", "Flexbox", "Table", "Float"], 1, "Flexbox is designed for one-dimensional layouts."),
        ("Which property makes text bold?", ["font-weight", "font-size", "font-family", "font-style"], 0, "font-weight controls the thickness of text."),
        ("Which value hides an element and removes its layout space?", ["visibility: hidden", "display: none", "opacity: 0", "position: hidden"], 1, "display: none removes the element from the document layout."),
        ("Which pseudo-class applies styles when hovering?", ["::before", ":focus", ":hover", "::after"], 2, ":hover applies styles when the pointer is over an element."),
        ("Which property creates rounded corners?", ["border-style", "border-radius", "corner-size", "outline-radius"], 1, "border-radius rounds the corners of an element."),
    ],

    "Cybersecurity": [
        ("What is cybersecurity?", ["Protecting systems and data from digital attacks", "Designing websites", "Managing databases", "Creating animations"], 0, "Cybersecurity protects systems, networks, and data from digital threats."),
        ("What is phishing?", ["A data backup method", "A fraudulent attempt to steal sensitive information", "A programming language", "A firewall setting"], 1, "Phishing uses deceptive messages to steal sensitive information."),
        ("What does MFA stand for?", ["Multiple File Access", "Multi-Factor Authentication", "Managed Firewall Application", "Main Function Access"], 1, "MFA requires multiple forms of verification."),
        ("What is a firewall used for?", ["Editing documents", "Filtering network traffic", "Creating passwords", "Compressing files"], 1, "A firewall monitors and controls incoming and outgoing network traffic."),
        ("Which is the strongest password practice?", ["Using your birth date", "Using the same password everywhere", "Using a long unique password", "Using only your name"], 2, "Long, unique passwords are harder to guess or crack."),
        ("What is malware?", ["A security certificate", "Malicious software", "A backup file", "A network cable"], 1, "Malware is software designed to harm or exploit systems."),
        ("What does HTTPS help provide?", ["Encrypted communication", "Faster typing", "Free hosting", "Automatic backups"], 0, "HTTPS uses TLS to protect data exchanged with a website."),
        ("What is ransomware?", ["Software that encrypts data and demands payment", "A password manager", "A web browser", "A backup schedule"], 0, "Ransomware locks or encrypts data and demands a ransom."),
        ("What is a vulnerability?", ["A system weakness that could be exploited", "A strong password", "A software update", "A backup copy"], 0, "A vulnerability is a weakness that attackers may exploit."),
        ("Why are security updates important?", ["To change screen brightness", "To fix bugs and security weaknesses", "To delete user accounts", "To increase file size"], 1, "Security updates often patch known vulnerabilities."),
    ],

    "Data Analysis": [
        ("What is data analysis?", ["Collecting, examining, and interpreting data", "Designing logos", "Installing operating systems", "Writing hardware drivers"], 0, "Data analysis turns raw data into useful insights."),
        ("Which tool is commonly used for spreadsheet analysis?", ["Microsoft Excel", "Adobe Photoshop", "VLC Player", "AutoCAD"], 0, "Excel provides formulas, tables, charts, and analysis tools."),
        ("What is a dataset?", ["A collection of related data", "A programming error", "A computer component", "A web browser"], 0, "A dataset is an organized collection of related data."),
        ("Which SQL command retrieves data?", ["INSERT", "UPDATE", "SELECT", "DELETE"], 2, "SELECT retrieves records from database tables."),
        ("What is the mean of 2, 4, and 6?", ["2", "3", "4", "6"], 2, "The mean is (2 + 4 + 6) divided by 3, which equals 4."),
        ("What does data cleaning involve?", ["Removing errors and inconsistencies", "Creating passwords", "Designing interfaces", "Installing software"], 0, "Data cleaning improves data quality by correcting errors and inconsistencies."),
        ("Which chart is suitable for comparing categories?", ["Bar chart", "Scatter plot only", "Network diagram", "Flowchart"], 0, "Bar charts are useful for comparing values across categories."),
        ("What is an outlier?", ["A value significantly different from other observations", "The average value", "A column heading", "A missing chart title"], 0, "An outlier is an observation that differs substantially from the rest."),
        ("What is a KPI?", ["Key Performance Indicator", "Known Programming Interface", "Kernel Processing Input", "Key Project Installation"], 0, "A KPI measures progress toward an important objective."),
        ("Why is data visualization useful?", ["It makes patterns and trends easier to understand", "It encrypts data", "It replaces databases", "It removes all errors automatically"], 0, "Visualization communicates patterns and trends clearly."),
    ],

    "Deep Learning": [
        ("What is deep learning?", ["A subset of machine learning using multi-layer neural networks", "A database system", "A web design technique", "A programming editor"], 0, "Deep learning uses neural networks with multiple layers."),
        ("What is an artificial neural network inspired by?", ["The human brain", "A hard disk", "A network cable", "A spreadsheet"], 0, "Artificial neural networks are loosely inspired by biological neural systems."),
        ("What is a neuron in a neural network?", ["A processing unit", "A database table", "A file format", "A network router"], 0, "A neuron receives inputs, applies weights and an activation function, and produces an output."),
        ("What is an activation function?", ["A function that transforms a neuron's input", "A data backup tool", "A sorting algorithm", "A database connection"], 0, "Activation functions introduce non-linearity into neural networks."),
        ("Which activation function is commonly used in hidden layers?", ["ReLU", "HTML", "SQL", "CSS"], 0, "ReLU is widely used in hidden layers of neural networks."),
        ("What is an epoch in deep learning?", ["One complete pass through the training dataset", "A type of database", "A programming language", "A network security rule"], 0, "An epoch means the model has processed the entire training dataset once."),
        ("What is overfitting?", ["A model performs well on training data but poorly on unseen data", "A model has no parameters", "A dataset contains no rows", "A computer has insufficient storage"], 0, "Overfitting occurs when a model memorizes training data and generalizes poorly."),
        ("What is backpropagation used for?", ["Computing gradients to update network weights", "Creating database tables", "Compressing images", "Connecting computers"], 0, "Backpropagation computes gradients used to train neural networks."),
        ("Which type of neural network is commonly used for image processing?", ["Convolutional Neural Network", "Decision table", "Linear database", "File system"], 0, "CNNs learn spatial features and are widely used for image tasks."),
        ("What is a loss function?", ["A measure of prediction error", "A user interface", "A storage device", "A programming editor"], 0, "A loss function measures how far predictions are from target values."),
    ],

    "Django": [
        ("What is Django?", ["A Python web framework", "A database language", "A CSS library", "An operating system"], 0, "Django is a high-level Python web framework."),
        ("Which language is used with Django?", ["Java", "Python", "C++", "PHP"], 1, "Django is built using Python."),
        ("Which command creates a Django project?", ["django-admin startproject", "django-admin runserver", "python createapp", "django install"], 0, "startproject creates a new Django project structure."),
        ("Which command creates a Django app?", ["python manage.py startapp", "python manage.py migrate", "python manage.py collectstatic", "python manage.py shell"], 0, "startapp creates a new Django application."),
        ("What is a Django model?", ["A Python class representing database data", "An HTML template", "A CSS selector", "A browser extension"], 0, "Models define data structure and database behavior."),
        ("What is Django ORM used for?", ["Interacting with databases using Python objects", "Designing images", "Managing browser tabs", "Writing CSS animations"], 0, "Django ORM maps Python models to database operations."),
        ("Which file commonly defines URL patterns in a Django app?", ["urls.py", "models.py", "admin.py", "tests.py"], 0, "urls.py maps URL patterns to views."),
        ("What is a Django view responsible for?", ["Handling a request and returning a response", "Creating hardware", "Styling HTML elements", "Installing Python"], 0, "Views contain request-handling logic and return responses."),
        ("Which command applies database migrations?", ["python manage.py migrate", "python manage.py startapp", "python manage.py createsuperuser", "python manage.py check"], 0, "migrate applies migration operations to the database."),
        ("What is Django REST Framework used for?", ["Building REST APIs with Django", "Creating desktop games", "Editing photographs", "Managing computer hardware"], 0, "Django REST Framework provides tools for building Web APIs."),
    ],

    "Docker": [
        ("What is Docker?", ["A containerization platform", "A programming language", "A database", "A web browser"], 0, "Docker is a platform for building and running containers."),
        ("What is a Docker container?", ["An isolated environment for running an application", "A physical server", "A database table", "A programming function"], 0, "Containers package applications and their dependencies in isolated environments."),
        ("Which command downloads an image from a registry?", ["docker pull", "docker push", "docker stop", "docker delete"], 0, "docker pull downloads an image from a registry."),
        ("Which command builds an image from a Dockerfile?", ["docker run", "docker build", "docker start", "docker logs"], 1, "docker build creates an image using a Dockerfile."),
        ("What is a Dockerfile?", ["A text file containing image build instructions", "A database backup", "A network configuration only", "A running container"], 0, "A Dockerfile defines instructions for building an image."),
        ("Which command lists running containers?", ["docker images", "docker ps", "docker build", "docker pull"], 1, "docker ps lists running containers by default."),
        ("What is Docker Hub?", ["A container image registry", "A programming editor", "A database server", "A cloud spreadsheet"], 0, "Docker Hub hosts and distributes container images."),
        ("Which command starts a container?", ["docker run", "docker image", "docker inspect", "docker tag"], 0, "docker run creates and starts a container."),
        ("What is Docker Compose used for?", ["Managing multi-container applications", "Editing source code", "Creating database queries", "Designing user interfaces"], 0, "Docker Compose defines and runs multi-container applications."),
        ("What is a Docker volume used for?", ["Persistent data storage", "Changing image colors", "Compiling programs", "Creating user accounts"], 0, "Volumes preserve data beyond a container's lifecycle."),
    ],

    "Excel": [
        ("What is Microsoft Excel mainly used for?", ["Spreadsheets and data analysis", "Video editing", "Web hosting", "Operating system development"], 0, "Excel is used for organizing, calculating, and analyzing data."),
        ("What is a cell in Excel?", ["The intersection of a row and column", "A complete worksheet", "A chart title", "A file extension"], 0, "A cell is the intersection of a row and a column."),
        ("Which symbol begins an Excel formula?", ["#", "=", "@", "&"], 1, "Excel formulas usually begin with an equals sign."),
        ("Which function adds numbers?", ["COUNT", "SUM", "MAX", "IF"], 1, "SUM adds values in selected cells."),
        ("Which function calculates the average?", ["AVERAGE", "SUM", "MIN", "ROUND"], 0, "AVERAGE returns the arithmetic mean."),
        ("Which function counts numeric cells?", ["COUNTA", "COUNT", "SUM", "LEFT"], 1, "COUNT counts cells containing numbers."),
        ("What is a PivotTable used for?", ["Summarizing and analyzing data", "Changing passwords", "Writing programs", "Editing images"], 0, "PivotTables summarize and explore large datasets."),
        ("Which feature arranges data in a particular order?", ["Sort", "Merge", "Wrap Text", "Freeze"], 0, "Sort arranges data in ascending or descending order."),
        ("What does the IF function do?", ["Checks a condition and returns a result", "Adds all cells", "Deletes worksheets", "Creates charts automatically"], 0, "IF returns one result when a condition is true and another when false."),
        ("Which reference stays fixed when a formula is copied?", ["A1", "$A$1", "A:A", "1:1"], 1, "An absolute reference such as $A$1 remains fixed when copied."),
    ],

    "Figma": [
        ("What is Figma primarily used for?", ["UI/UX design and prototyping", "Database administration", "Video streaming", "Operating system installation"], 0, "Figma is a collaborative interface design and prototyping tool."),
        ("What is a frame in Figma?", ["A container for design elements", "A programming language", "A database record", "An image filter"], 0, "Frames organize and contain design elements."),
        ("What is a component in Figma?", ["A reusable design element", "A spreadsheet formula", "A server process", "A file compression tool"], 0, "Components allow reusable design elements across files."),
        ("What is an instance in Figma?", ["A copy linked to a main component", "A new font family", "A database connection", "A page transition"], 0, "Instances inherit properties from their main component."),
        ("What is prototyping used for?", ["Creating interactive design flows", "Writing SQL queries", "Compressing images", "Managing servers"], 0, "Prototypes demonstrate how users interact with a design."),
        ("What does Auto Layout help with?", ["Automatically arranging and spacing elements", "Creating database tables", "Writing JavaScript", "Exporting videos"], 0, "Auto Layout manages spacing and resizing of elements."),
        ("What is a design system?", ["A collection of reusable design rules and components", "A computer operating system", "A database backup", "A programming compiler"], 0, "Design systems maintain consistency through shared components and styles."),
        ("Which feature allows multiple designers to work together?", ["Real-time collaboration", "Offline printing", "Code compilation", "File encryption"], 0, "Figma supports collaborative editing in real time."),
        ("What is a variant in Figma?", ["A related version of a component", "A database query", "A page URL", "An image format"], 0, "Variants group related component states or properties."),
        ("Which Figma feature previews interactive screens?", ["Present mode", "Inspect only", "Rename", "Export settings"], 0, "Present mode allows users to preview prototypes."),
    ],

    "Git": [
        ("What is Git?", ["A distributed version control system", "A programming language", "A database", "A web browser"], 0, "Git tracks changes in source code and other files."),
        ("Which command initializes a Git repository?", ["git start", "git init", "git create", "git new"], 1, "git init initializes a new Git repository."),
        ("Which command checks repository status?", ["git status", "git push", "git merge", "git clone"], 0, "git status displays the current working tree status."),
        ("Which command stages changes?", ["git commit", "git add", "git pull", "git log"], 1, "git add stages changes for the next commit."),
        ("Which command saves staged changes in history?", ["git push", "git commit", "git fetch", "git status"], 1, "git commit records staged changes in repository history."),
        ("Which command displays commit history?", ["git log", "git init", "git clean", "git reset"], 0, "git log displays commit history."),
        ("Which command creates a new branch?", ["git branch branch-name", "git delete branch-name", "git push branch-name", "git log branch-name"], 0, "git branch with a name creates a branch."),
        ("Which command combines another branch into the current branch?", ["git merge", "git clone", "git status", "git init"], 0, "git merge integrates changes from another branch."),
        ("What does git clone do?", ["Copies a remote repository locally", "Deletes a repository", "Stages files", "Creates a commit"], 0, "git clone creates a local copy of a remote repository."),
        ("Which command downloads and integrates remote changes?", ["git pull", "git add", "git commit", "git init"], 0, "git pull fetches remote changes and integrates them into the current branch."),
    ],

    "GitHub": [
        ("What is GitHub?", ["A platform for hosting and collaborating on Git repositories", "A programming language", "A database engine", "An operating system"], 0, "GitHub hosts Git repositories and supports collaboration."),
        ("What is a repository on GitHub?", ["A project space containing files and version history", "A user password", "A programming function", "A network cable"], 0, "A repository stores project files and their version history."),
        ("What is a pull request?", ["A proposal to merge code changes", "A database backup", "A new user account", "A file compression method"], 0, "Pull requests allow teams to review and discuss proposed changes."),
        ("What is a fork?", ["A personal copy of another repository", "A deleted branch", "A programming error", "A commit message"], 0, "A fork creates a separate copy of a repository under another account."),
        ("What is an issue used for?", ["Tracking bugs, tasks, and discussions", "Compiling code", "Changing screen resolution", "Creating passwords"], 0, "Issues help track bugs, feature requests, and tasks."),
        ("What is a README file?", ["A document describing a project", "A database server", "A programming compiler", "An image editor"], 0, "README files explain a project's purpose and usage."),
        ("What is GitHub Actions used for?", ["Automating workflows and CI/CD", "Editing photographs", "Managing hardware", "Creating spreadsheets"], 0, "GitHub Actions automates repository workflows."),
        ("What is a branch used for?", ["Developing changes separately from other work", "Deleting the repository", "Encrypting passwords", "Creating a database"], 0, "Branches provide separate lines of development."),
        ("What does repository visibility control?", ["Who can access a repository", "How fast code runs", "The programming language", "The file size"], 0, "Visibility determines whether a repository is public or private."),
        ("What is a GitHub organization?", ["An account for managing teams and repositories", "A code editor", "A database table", "A web browser"], 0, "Organizations help teams manage shared repositories and access."),
    ],

    "HTML": [
        ("What does HTML stand for?", ["HyperText Markup Language", "HighText Machine Language", "HyperTool Multi Language", "HomeText Markup Language"], 0, "HTML stands for HyperText Markup Language."),
        ("Which tag creates the largest heading?", ["<h6>", "<head>", "<h1>", "<header>"], 2, "The h1 element represents the highest-level heading."),
        ("Which tag creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1, "The anchor element creates hyperlinks using the href attribute."),
        ("Which tag inserts an image?", ["<image>", "<pic>", "<img>", "<src>"], 2, "The img element embeds an image in an HTML document."),
        ("Which attribute specifies an image's alternative text?", ["title", "alt", "name", "description"], 1, "The alt attribute provides alternative text for an image."),
        ("Which tag creates an unordered list?", ["<ol>", "<li>", "<ul>", "<list>"], 2, "The ul element creates an unordered list."),
        ("Which element contains metadata and the document title?", ["<body>", "<main>", "<footer>", "<head>"], 3, "The head element contains document metadata."),
        ("Which HTML element creates a form?", ["<form>", "<input>", "<fieldset>", "<label>"], 0, "The form element groups controls for submitting user input."),
        ("Which semantic element represents the main page content?", ["<aside>", "<main>", "<nav>", "<small>"], 1, "The main element represents the dominant content of a document."),
        ("Which attribute uniquely identifies an HTML element?", ["class", "style", "id", "type"], 2, "An id uniquely identifies an element within a document."),
    ],

    "Java": [
        ("Which company originally developed Java?", ["Microsoft", "Sun Microsystems", "Google", "IBM"], 1, "Sun Microsystems originally developed Java."),
        ("Which method is the usual entry point of a Java application?", ["start()", "run()", "main()", "execute()"], 2, "The main method is the standard entry point of a Java application."),
        ("Which keyword creates an object in Java?", ["class", "new", "this", "void"], 1, "The new keyword creates an object."),
        ("Which type stores true or false values?", ["int", "char", "boolean", "double"], 2, "The boolean type stores true or false values."),
        ("Which keyword is used to inherit a class?", ["implements", "extends", "inherits", "super"], 1, "The extends keyword establishes class inheritance."),
        ("Which collection stores unique elements?", ["ArrayList", "LinkedList", "HashSet", "Vector"], 2, "HashSet stores unique elements without duplicates."),
        ("Which block handles an exception?", ["try", "catch", "finally", "All of these"], 3, "Java exception handling uses try, catch, and optionally finally blocks."),
        ("Which keyword prevents a variable from being reassigned?", ["static", "final", "private", "const"], 1, "The final keyword prevents reassignment of a variable."),
        ("Which concept allows methods with the same name but different parameters?", ["Overriding", "Overloading", "Encapsulation", "Abstraction"], 1, "Method overloading uses the same method name with different parameter lists."),
        ("Which feature automatically manages unused objects' memory?", ["Pointers", "Garbage collection", "Manual allocation", "Compilation"], 1, "Java garbage collection reclaims memory used by unreachable objects."),
    ],

    "JavaScript": [
        ("Which keyword declares a block-scoped variable that can be reassigned?", ["var", "let", "const", "static"], 1, "let declares a block-scoped variable that can be reassigned."),
        ("Which method prints a message in the browser console?", ["console.log()", "print()", "echo()", "writeLine()"], 0, "console.log() writes information to the browser console."),
        ("Which operator checks strict equality?", ["==", "=", "===", "!="], 2, "The === operator compares values without type coercion."),
        ("Which data type represents an intentional absence of a value?", ["undefined", "null", "boolean", "string"], 1, "null represents an intentional absence of an object value."),
        ("Which method adds an item to the end of an array?", ["pop()", "shift()", "push()", "slice()"], 2, "push() appends one or more elements to an array."),
        ("Which function converts JSON text into a JavaScript value?", ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.read()"], 1, "JSON.parse() parses JSON text into a JavaScript value."),
        ("Which syntax defines an arrow function?", ["function =>", "() =>", "->", "function() ->"], 1, "The () => syntax defines an arrow function."),
        ("Which method selects an element by its ID?", ["querySelectorAll()", "getElementById()", "getElementsByClassName()", "createElement()"], 1, "getElementById() selects an element using its ID."),
        ("What does Promise represent?", ["A future result of an asynchronous operation", "A CSS selector", "A database table", "A loop"], 0, "A Promise represents the eventual success or failure of an asynchronous operation."),
        ("Which statement handles errors using exceptions?", ["switch", "for", "try...catch", "while"], 2, "try...catch handles exceptions in JavaScript."),
    ],

    "Kotlin": [
        ("Kotlin was developed by which company?", ["Google", "JetBrains", "Microsoft", "Oracle"], 1, "JetBrains developed Kotlin."),
        ("Which keyword declares a read-only variable?", ["var", "val", "let", "const"], 1, "val declares a read-only reference in Kotlin."),
        ("Which keyword declares a mutable variable?", ["val", "var", "fun", "object"], 1, "var declares a variable that can be reassigned."),
        ("Which keyword declares a function?", ["def", "function", "fun", "method"], 2, "Kotlin uses the fun keyword to declare functions."),
        ("Which symbol is used for safe calls?", [".", "!!", "?.", "::"], 2, "The safe-call operator ?. avoids accessing members on a null receiver."),
        ("Which keyword declares a class?", ["struct", "class", "type", "new"], 1, "The class keyword declares a class in Kotlin."),
        ("What is a data class mainly used for?", ["Storing data with generated utility methods", "Creating network servers", "Building database engines", "Compiling CSS"], 0, "Data classes automatically provide methods such as equals, hashCode, and toString."),
        ("Which function is commonly used as the entry point?", ["start()", "main()", "init()", "runApp()"], 1, "The main function is the standard entry point of a Kotlin application."),
        ("Which keyword handles inheritance by allowing a class to be extended?", ["open", "final", "private", "sealed"], 0, "Classes and members are final by default; open allows inheritance or overriding."),
        ("Which feature helps prevent null pointer errors?", ["Nullable types", "Global variables", "Multiple inheritance", "Pointers"], 0, "Kotlin's type system distinguishes nullable and non-nullable types."),
    ],

    "Machine Learning": [
        ("What is machine learning?", ["A method where systems learn patterns from data", "A type of computer hardware", "A web design language", "A database format"], 0, "Machine learning uses data to learn patterns and make predictions or decisions."),
        ("Which type of learning uses labeled training data?", ["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Random learning"], 1, "Supervised learning trains models using labeled examples."),
        ("Which task predicts a continuous numerical value?", ["Classification", "Clustering", "Regression", "Sorting"], 2, "Regression predicts continuous numerical values."),
        ("Which task assigns data to predefined categories?", ["Regression", "Classification", "Dimensionality reduction", "Normalization"], 1, "Classification predicts a discrete class or category."),
        ("What is overfitting?", ["A model performs well on training data but poorly on unseen data", "A model has no parameters", "A model always predicts zero", "A dataset has no labels"], 0, "Overfitting occurs when a model learns training-specific patterns that do not generalize."),
        ("Why is a test dataset used?", ["To evaluate performance on unseen data", "To train the model repeatedly", "To remove all features", "To increase file size"], 0, "A test dataset estimates how well a trained model generalizes."),
        ("What is a feature in machine learning?", ["An input variable used by a model", "The final prediction only", "A model error", "A training algorithm"], 0, "Features are input variables used to make predictions."),
        ("Which algorithm is commonly used for classification and regression?", ["Decision Tree", "Bubble Sort", "Binary Search", "Dijkstra's Algorithm"], 0, "Decision trees can be used for both classification and regression."),
        ("What is a confusion matrix used for?", ["Evaluating classification predictions", "Storing images", "Writing code", "Compressing datasets"], 0, "A confusion matrix compares actual and predicted class labels."),
        ("What is the purpose of feature scaling?", ["Putting features on comparable numerical scales", "Deleting target labels", "Increasing duplicate records", "Changing the programming language"], 0, "Feature scaling helps prevent features with large numerical ranges from dominating some algorithms."),
    ],

    "MongoDB": [
        ("What type of database is MongoDB?", ["Relational", "Document-oriented NoSQL", "Graph only", "Key-value only"], 1, "MongoDB is a document-oriented NoSQL database."),
        ("Which format does MongoDB use to store documents?", ["XML", "BSON", "CSV", "HTML"], 1, "MongoDB stores documents using BSON, a binary representation of JSON-like data."),
        ("Which method inserts one document?", ["insertOne()", "addOne()", "createRow()", "pushOne()"], 0, "insertOne() inserts a single document into a collection."),
        ("Which method retrieves documents?", ["find()", "getRow()", "selectAll()", "readTable()"], 0, "find() retrieves documents matching a query."),
        ("What is a collection in MongoDB?", ["A group of documents", "A database server", "A single field", "A programming function"], 0, "A collection stores related MongoDB documents."),
        ("Which method updates one matching document?", ["updateOne()", "changeOne()", "modifyRow()", "editOne()"], 0, "updateOne() modifies the first document matching the filter."),
        ("Which method deletes one matching document?", ["removeAll()", "deleteOne()", "dropDatabase()", "eraseRow()"], 1, "deleteOne() removes the first document matching the filter."),
        ("Which operator sets a field value during an update?", ["$set", "$push", "$match", "$sort"], 0, "$set updates the value of specified fields."),
        ("What does an ObjectId represent?", ["A unique document identifier", "A database password", "A collection name", "A query operator"], 0, "ObjectId is commonly used as the unique _id value for a MongoDB document."),
        ("What is MongoDB aggregation used for?", ["Processing and analyzing documents", "Creating CSS styles", "Compiling Java code", "Managing operating systems"], 0, "Aggregation pipelines process documents through stages for analysis."),
    ],

    "MySQL": [
        ("What is MySQL?", ["A relational database management system", "A programming language", "A web browser", "An operating system"], 0, "MySQL is a relational database management system."),
        ("Which language is used to query MySQL?", ["HTML", "SQL", "CSS", "XML"], 1, "SQL is used to define, query, and manipulate relational databases."),
        ("Which command retrieves records?", ["INSERT", "SELECT", "UPDATE", "DELETE"], 1, "SELECT retrieves data from database tables."),
        ("Which clause filters records?", ["ORDER BY", "GROUP BY", "WHERE", "LIMIT"], 2, "WHERE filters records based on a condition."),
        ("Which command adds a new row?", ["INSERT INTO", "ADD ROW", "CREATE ROW", "APPEND TABLE"], 0, "INSERT INTO adds new records to a table."),
        ("Which command modifies existing records?", ["CHANGE", "UPDATE", "ALTER DATABASE", "REPLACE TABLE"], 1, "UPDATE modifies existing records in a table."),
        ("What is a primary key?", ["A unique identifier for each row", "A duplicate column", "A database backup", "A sorting rule"], 0, "A primary key uniquely identifies each record in a table."),
        ("What is a foreign key?", ["A field referencing a key in another or the same table", "A password", "An index file", "A database name"], 0, "A foreign key establishes referential relationships between tables."),
        ("Which function counts rows?", ["SUM()", "COUNT()", "AVG()", "MAX()"], 1, "COUNT() returns the number of rows or non-NULL values depending on its argument."),
        ("Which clause sorts query results?", ["WHERE", "HAVING", "ORDER BY", "JOIN"], 2, "ORDER BY sorts query results in ascending or descending order."),
    ],

    "Networking": [
        ("What is a computer network?", ["Connected devices that communicate and share resources", "A single application", "A programming language", "A database table"], 0, "A computer network connects devices for communication and resource sharing."),
        ("What does IP stand for?", ["Internet Protocol", "Internal Program", "Integrated Process", "Information Port"], 0, "IP stands for Internet Protocol."),
        ("Which device forwards packets between networks?", ["Switch", "Router", "Keyboard", "Printer"], 1, "Routers forward packets between different networks."),
        ("What does DNS do?", ["Translates domain names into IP addresses", "Encrypts files", "Stores passwords", "Creates websites"], 0, "DNS resolves domain names to corresponding IP addresses."),
        ("Which protocol is commonly used for secure web browsing?", ["HTTP", "FTP", "HTTPS", "SMTP"], 2, "HTTPS uses TLS to secure communication between browsers and web servers."),
        ("What is the default port for HTTP?", ["21", "25", "80", "443"], 2, "HTTP commonly uses TCP port 80."),
        ("What is the default port for HTTPS?", ["22", "53", "80", "443"], 3, "HTTPS commonly uses TCP port 443."),
        ("Which protocol automatically assigns IP addresses?", ["DNS", "DHCP", "FTP", "SSH"], 1, "DHCP automatically provides network configuration such as IP addresses."),
        ("What does LAN stand for?", ["Local Area Network", "Large Access Node", "Linked Application Network", "Long Area Number"], 0, "LAN stands for Local Area Network."),
        ("Which command can test network reachability?", ["ping", "mkdir", "copy", "format"], 0, "ping tests reachability using ICMP echo requests."),
    ],

    "Node.js": [
        ("What is Node.js?", ["A JavaScript runtime environment", "A database", "A CSS framework", "A web browser"], 0, "Node.js runs JavaScript outside the browser."),
        ("Which engine powers Node.js?", ["SpiderMonkey", "V8", "JavaScriptCore only", "Chakra only"], 1, "Node.js uses Google's V8 JavaScript engine."),
        ("Which command checks the installed Node.js version?", ["node --version", "npm --install", "node --check", "js --version"], 0, "node --version displays the installed Node.js version."),
        ("What is npm?", ["Node Package Manager", "Network Process Module", "New Programming Method", "Node Project Monitor"], 0, "npm manages packages and dependencies in JavaScript projects."),
        ("Which file commonly stores project dependencies and scripts?", ["index.html", "package.json", "server.css", "README.png"], 1, "package.json stores project metadata, scripts, and dependency declarations."),
        ("Which built-in module handles file system operations?", ["http", "path", "fs", "events"], 2, "The fs module provides file system operations."),
        ("Which module can create an HTTP server?", ["http", "crypto", "os", "util"], 0, "The built-in http module can create HTTP servers."),
        ("What does non-blocking I/O mean?", ["Operations can proceed without waiting synchronously for each result", "The server is always offline", "Files cannot be read", "JavaScript is disabled"], 0, "Non-blocking I/O allows other work to continue while an operation completes."),
        ("Which object provides access to environment variables?", ["process.env", "window.env", "global.config", "node.settings"], 0, "process.env exposes environment variables to Node.js applications."),
        ("What is Express.js?", ["A web framework for Node.js", "A database engine", "A Java compiler", "An operating system"], 0, "Express.js is a web framework commonly used to build Node.js applications."),
    ],

    "PostgreSQL": [
        ("What is PostgreSQL?", ["A relational object database system", "A programming language", "A web server", "A spreadsheet"], 0, "PostgreSQL is an open-source relational object database system."),
        ("Which language is commonly used to query PostgreSQL?", ["SQL", "HTML", "CSS", "Bash only"], 0, "PostgreSQL supports SQL for database queries."),
        ("Which command creates a table?", ["MAKE TABLE", "CREATE TABLE", "NEW TABLE", "ADD TABLE"], 1, "CREATE TABLE defines a new table."),
        ("Which data type stores true or false?", ["TEXT", "INTEGER", "BOOLEAN", "DATE"], 2, "BOOLEAN stores true or false values."),
        ("Which clause filters rows?", ["WHERE", "ORDER BY", "LIMIT", "DISTINCT"], 0, "WHERE filters rows based on a condition."),
        ("Which command adds a row?", ["INSERT INTO", "ADD RECORD", "PUSH ROW", "CREATE ROW"], 0, "INSERT INTO adds records to a table."),
        ("What is a PostgreSQL primary key?", ["A constraint uniquely identifying rows", "A backup file", "A query plan", "A user password"], 0, "A primary key enforces unique identification of table rows."),
        ("Which PostgreSQL feature stores structured JSON data in a binary format?", ["JSONB", "XMLB", "TEXTFILE", "BYTEA only"], 0, "JSONB stores JSON data in a decomposed binary format that supports indexing."),
        ("Which command lists databases in the psql terminal?", ["\\dt", "\\l", "\\du", "\\q"], 1, "The psql command \\l lists databases."),
        ("Which feature helps maintain data integrity across related tables?", ["Foreign key constraints", "CSS selectors", "HTML attributes", "File extensions"], 0, "Foreign key constraints enforce referential integrity."),
    ],

    "Power BI": [
        ("What is Power BI?", ["A business intelligence and data visualization tool", "A programming language", "An operating system", "A database server"], 0, "Power BI helps analyze data and create interactive reports."),
        ("Which language is used for Power BI calculations?", ["Python only", "DAX", "HTML", "CSS"], 1, "DAX is used to create calculations and measures in Power BI."),
        ("What is Power Query used for?", ["Data cleaning and transformation", "Creating passwords", "Writing operating systems", "Editing videos"], 0, "Power Query connects to, cleans, and transforms data."),
        ("What is a Power BI dashboard?", ["A single-page collection of visualizations", "A database table", "A programming script", "A text document"], 0, "A dashboard presents important visualizations on one page."),
        ("Which view is used to create relationships between tables?", ["Report View", "Model View", "Reading View", "Print View"], 1, "Model View is used to manage relationships between tables."),
        ("What is a measure in Power BI?", ["A calculation evaluated in the current filter context", "A type of chart", "A data source", "A page background"], 0, "Measures are dynamic calculations commonly written using DAX."),
        ("Which chart is suitable for showing trends over time?", ["Line chart", "Pie chart", "Card visual", "Gauge only"], 0, "Line charts are useful for showing changes over time."),
        ("What is a slicer used for?", ["Filtering report data interactively", "Deleting a table", "Writing DAX automatically", "Exporting source code"], 0, "Slicers let report users interactively filter data."),
        ("What is Power BI Service?", ["The cloud-based Power BI platform", "A programming language", "A database query", "A desktop operating system"], 0, "Power BI Service is Microsoft's cloud platform for publishing and sharing reports."),
        ("What is a relationship in Power BI?", ["A connection between tables using related columns", "A chart color", "A report title", "A file format"], 0, "Relationships connect tables so data can be analyzed together."),
    ],

    "Python": [
        ("Who created Python?", ["James Gosling", "Guido van Rossum", "Dennis Ritchie", "Brendan Eich"], 1, "Guido van Rossum created Python."),
        ("Which keyword defines a function in Python?", ["function", "def", "fun", "method"], 1, "The def keyword defines a function in Python."),
        ("Which data type stores key-value pairs?", ["List", "Tuple", "Dictionary", "Set"], 2, "A dictionary stores data as key-value pairs."),
        ("Which symbol starts a comment in Python?", ["//", "#", "/*", "--"], 1, "The hash symbol starts a single-line comment in Python."),
        ("Which method adds an item to a list?", ["append()", "addItem()", "insertEnd()", "pushBack()"], 0, "append() adds an item to the end of a list."),
        ("What is the output of len([1, 2, 3])?", ["2", "3", "4", "1"], 1, "The len() function returns the number of items, which is three."),
        ("Which keyword handles exceptions?", ["catch", "error", "try", "check"], 2, "Python uses try and except blocks to handle exceptions."),
        ("Which operator performs exponentiation?", ["^", "**", "//", "%"], 1, "The ** operator raises a number to a power."),
        ("Which keyword is used to create a class?", ["object", "struct", "class", "define"], 2, "The class keyword defines a class in Python."),
        ("What does a Python virtual environment provide?", ["An isolated project dependency environment", "A physical server", "A database backup", "A web browser"], 0, "Virtual environments isolate project packages and dependencies."),
    ],

    "React.js": [
        ("What is React.js?", ["A JavaScript library for building user interfaces", "A database", "A programming language", "An operating system"], 0, "React is a JavaScript library for building component-based user interfaces."),
        ("Who originally developed React?", ["Google", "Meta (Facebook)", "Microsoft", "Amazon"], 1, "React was originally developed at Facebook, now Meta."),
        ("What is a React component?", ["A reusable UI building block", "A database table", "A CSS file only", "A server port"], 0, "Components are reusable pieces of a React interface."),
        ("Which hook manages state in a function component?", ["useEffect", "useState", "useRef", "useMemo"], 1, "useState adds state to function components."),
        ("What is JSX?", ["A syntax extension for JavaScript", "A database query language", "A CSS framework", "A server protocol"], 0, "JSX lets developers write HTML-like syntax in JavaScript."),
        ("What are props in React?", ["Inputs passed from parent components", "Database records", "CSS animations", "Browser cookies"], 0, "Props pass data from a parent component to a child component."),
        ("Which hook performs side effects?", ["useState", "useEffect", "useContext", "useId"], 1, "useEffect handles side effects such as subscriptions and data fetching."),
        ("Why are keys used when rendering lists?", ["To help React identify list items across updates", "To encrypt components", "To style buttons", "To create routes"], 0, "Keys help React track items efficiently when lists change."),
        ("What is the Virtual DOM?", ["An in-memory representation of the UI", "A physical database", "A CSS compiler", "A web server"], 0, "React uses a virtual representation of the UI to determine updates."),
        ("Which tool is commonly used for routing in React applications?", ["React Router", "NumPy", "Django ORM", "MySQL Workbench"], 0, "React Router provides client-side routing for React applications."),
    ],

    "REST API": [
        ("What does REST stand for?", ["Representational State Transfer", "Remote Server Technology", "Reliable Software Transfer", "Resource System Tracking"], 0, "REST stands for Representational State Transfer."),
        ("Which HTTP method is commonly used to retrieve data?", ["POST", "GET", "DELETE", "PATCH"], 1, "GET requests retrieve representations of resources."),
        ("Which HTTP method is commonly used to create a resource?", ["GET", "POST", "HEAD", "OPTIONS"], 1, "POST is commonly used to submit data and create resources."),
        ("Which HTTP status code means OK?", ["200", "301", "404", "500"], 0, "HTTP 200 indicates that the request succeeded."),
        ("What does HTTP 404 indicate?", ["Success", "Unauthorized", "Resource not found", "Server error"], 2, "HTTP 404 means the requested resource could not be found."),
        ("Which format is commonly used for REST API responses?", ["JSON", "MP3", "EXE", "PSD"], 0, "JSON is a common format for exchanging API data."),
        ("What is an API endpoint?", ["A URL representing an API resource or operation", "A database password", "A CSS selector", "A programming variable"], 0, "An endpoint is an address through which an API can be accessed."),
        ("Which HTTP method is commonly used to partially update a resource?", ["GET", "PATCH", "HEAD", "TRACE"], 1, "PATCH applies partial modifications to a resource."),
        ("What is authentication in an API?", ["Verifying the identity of a client or user", "Sorting database rows", "Compressing images", "Changing page colors"], 0, "Authentication verifies who is making an API request."),
        ("What is the purpose of API pagination?", ["Returning large result sets in smaller sections", "Encrypting passwords", "Creating database tables", "Changing HTTP methods"], 0, "Pagination divides large result sets into manageable pages."),
    ],

    "Selenium": [
        ("What is Selenium primarily used for?", ["Automating web browsers", "Managing databases", "Editing images", "Creating operating systems"], 0, "Selenium automates browser interactions for web application testing."),
        ("Which programming language can be used with Selenium?", ["Python", "Java", "C#", "All of these"], 3, "Selenium supports several languages, including Python, Java, and C#."),
        ("Which Selenium component provides browser automation APIs?", ["Selenium WebDriver", "Selenium Grid only", "Selenium IDE only", "JDBC"], 0, "WebDriver provides APIs for controlling web browsers."),
        ("Which method opens a URL in Selenium WebDriver?", ["open()", "get()", "visitPage()", "loadURL()"], 1, "The get() method navigates the browser to a specified URL."),
        ("Which locator identifies an element by its HTML ID?", ["By.CLASS_NAME", "By.ID", "By.TAG_NAME", "By.LINK_TEXT"], 1, "By.ID locates an element using its id attribute."),
        ("Which method clicks a web element?", ["press()", "tap()", "click()", "select()"], 2, "The click() method performs a click on a web element."),
        ("What is an explicit wait used for?", ["Waiting for a specific condition before proceeding", "Closing the browser", "Deleting cookies", "Installing a driver"], 0, "Explicit waits pause execution until a specified condition is met or a timeout occurs."),
        ("Which method closes the current browser window?", ["quit()", "close()", "stopAll()", "exitBrowser()"], 1, "close() closes the current browser window."),
        ("What is Selenium Grid used for?", ["Running tests across multiple machines and browser environments", "Creating databases", "Writing CSS", "Managing email"], 0, "Selenium Grid supports distributed and parallel browser testing."),
        ("What is a test assertion?", ["A check that verifies an expected result", "A browser extension", "A network cable", "A database backup"], 0, "Assertions compare actual results with expected results."),
    ],

    "Software Testing": [
        ("What is software testing?", ["Evaluating software to find defects and verify requirements", "Writing only documentation", "Designing hardware", "Installing operating systems"], 0, "Software testing checks whether software meets requirements and identifies defects."),
        ("What is unit testing?", ["Testing individual components or functions", "Testing the entire organization", "Testing network cables", "Testing only user interfaces"], 0, "Unit testing verifies small, isolated units of code."),
        ("What is integration testing?", ["Testing interactions between combined components", "Testing one variable only", "Testing computer hardware", "Testing website colors"], 0, "Integration testing checks whether connected components work correctly together."),
        ("What is regression testing?", ["Checking that changes have not broken existing functionality", "Testing only new hardware", "Deleting old test cases", "Measuring internet speed"], 0, "Regression testing verifies that existing features still work after changes."),
        ("What is a test case?", ["A set of steps, inputs, and expected results", "A programming language", "A database server", "A design template"], 0, "A test case describes how to verify a particular requirement or behavior."),
        ("What is black-box testing?", ["Testing functionality without examining internal code", "Testing source code line by line", "Testing server hardware", "Testing database backups only"], 0, "Black-box testing focuses on inputs and outputs rather than internal implementation."),
        ("What is the purpose of a bug report?", ["Documenting a software defect and its details", "Creating a new programming language", "Designing a logo", "Installing an application"], 0, "A bug report helps developers understand and reproduce a defect."),
        ("What is smoke testing?", ["A basic check that critical functions work after a build", "Testing every possible input", "Testing only database speed", "Checking hardware temperature"], 0, "Smoke testing checks whether the major functions of a build are stable enough for further testing."),
        ("What is automation testing?", ["Using tools or scripts to execute tests automatically", "Testing without any test cases", "Manually checking every screen", "Creating wireframes"], 0, "Automation testing uses scripts and tools to execute repeatable test cases."),
        ("What is the software testing life cycle (STLC)?", ["A sequence of activities performed during testing", "A programming framework", "A database design method", "A deployment server"], 0, "STLC describes the phases and activities involved in software testing."),
    ],

    "SQL": [
        ("What does SQL stand for?", ["Structured Query Language", "Simple Question Language", "System Query Logic", "Standard Quick Language"], 0, "SQL stands for Structured Query Language."),
        ("Which command retrieves data from a table?", ["INSERT", "SELECT", "UPDATE", "DELETE"], 1, "SELECT retrieves records from one or more database tables."),
        ("Which clause filters records based on a condition?", ["ORDER BY", "GROUP BY", "WHERE", "JOIN"], 2, "WHERE filters rows using a specified condition."),
        ("Which command adds new records to a table?", ["INSERT INTO", "ADD ROW", "CREATE RECORD", "APPEND"], 0, "INSERT INTO adds new records to a table."),
        ("Which command modifies existing records?", ["CHANGE", "UPDATE", "ALTER", "MODIFY TABLE"], 1, "UPDATE changes existing records in a table."),
        ("Which command removes records from a table?", ["DROP", "DELETE", "REMOVE TABLE", "CLEAR"], 1, "DELETE removes selected records from a table."),
        ("Which function returns the number of rows?", ["SUM()", "AVG()", "COUNT()", "MAX()"], 2, "COUNT() returns the number of rows or non-NULL values, depending on its argument."),
        ("Which clause groups rows with matching values?", ["GROUP BY", "ORDER BY", "WHERE", "LIMIT"], 0, "GROUP BY groups rows that share values in specified columns."),
        ("Which JOIN returns only matching rows from both tables?", ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], 2, "INNER JOIN returns rows with matching values in both tables."),
        ("What is a primary key?", ["A column or set of columns that uniquely identifies each row", "A duplicate record", "A database password", "A sorting command"], 0, "A primary key uniquely identifies each record in a table."),
    ],

    "TypeScript": [
        ("What is TypeScript?", ["A typed superset of JavaScript", "A database engine", "A CSS framework", "An operating system"], 0, "TypeScript adds static typing and other features to JavaScript."),
        ("Which company developed TypeScript?", ["Google", "Microsoft", "Meta", "Oracle"], 1, "Microsoft developed TypeScript."),
        ("Which file extension is commonly used for TypeScript files?", [".js", ".html", ".ts", ".css"], 2, "The .ts extension is commonly used for TypeScript source files."),
        ("Which keyword declares a variable that cannot be reassigned?", ["let", "var", "const", "static"], 2, "const declares a variable binding that cannot be reassigned."),
        ("Which type represents text?", ["number", "string", "boolean", "void"], 1, "The string type represents textual data."),
        ("Which type represents true or false values?", ["string", "number", "boolean", "object"], 2, "The boolean type represents true or false values."),
        ("What is an interface used for?", ["Defining the structure of an object", "Running a database query", "Styling a web page", "Starting a server"], 0, "Interfaces describe the expected structure of objects."),
        ("Which symbol is used for optional properties in an interface?", ["!", "?", "#", "&"], 1, "The question mark marks an interface property as optional."),
        ("What is a union type?", ["A type that allows one of several specified types", "A database relationship", "A CSS selector", "A browser event"], 0, "Union types allow a value to be one of multiple specified types."),
        ("What does the TypeScript compiler produce from TypeScript code?", ["JavaScript code", "SQL tables", "HTML images", "Python modules"], 0, "The TypeScript compiler transforms TypeScript into JavaScript."),
    ],

    "UI/UX Design": [
        ("What does UI stand for?", ["User Interface", "Universal Internet", "User Integration", "Unified Information"], 0, "UI stands for User Interface, the visual and interactive elements of a product."),
        ("What does UX stand for?", ["User Experience", "User Extension", "Universal Exchange", "Unified Execution"], 0, "UX stands for User Experience, covering the overall experience of using a product."),
        ("What is a wireframe?", ["A basic structural layout of a screen", "A finished software application", "A database schema", "A programming language"], 0, "Wireframes show the structure and placement of interface elements."),
        ("What is a prototype?", ["An interactive model of a proposed design", "A database backup", "A final production server", "A programming compiler"], 0, "Prototypes simulate interactions and help validate design ideas."),
        ("What is usability testing?", ["Observing users as they complete tasks with a product", "Checking only source code", "Measuring server temperature", "Creating a logo"], 0, "Usability testing identifies difficulties users experience while using a product."),
        ("What is visual hierarchy?", ["Arranging elements to communicate their relative importance", "Connecting database tables", "Writing application logic", "Compressing images"], 0, "Visual hierarchy guides attention through size, contrast, spacing, and placement."),
        ("What is a design system?", ["A collection of reusable components, styles, and guidelines", "A programming language", "A network protocol", "A database engine"], 0, "A design system promotes consistency through shared design resources and rules."),
        ("What is accessibility in design?", ["Making products usable by people with different abilities", "Using only large fonts", "Adding more animations", "Restricting keyboard navigation"], 0, "Accessible design considers diverse abilities and ways of interacting with a product."),
        ("What is responsive design?", ["Designing interfaces that adapt to different screen sizes", "Designing only for desktop", "Creating database backups", "Writing server scripts"], 0, "Responsive design adapts layouts to different devices and screen sizes."),
        ("What is a user persona?", ["A research-based representation of a target user", "A programming function", "A website URL", "A database table"], 0, "Personas summarize user characteristics, needs, and goals to guide design decisions."),
    ],
}


class Command(BaseCommand):
    help = "Create or update assessment categories and questions for skills."

    @transaction.atomic
    def handle(self, *args, **options):
        created_questions = 0
        updated_questions = 0

        for skill_name, questions in ASSESSMENTS.items():
            skill = Skill.objects.filter(name__iexact=skill_name).first()

            if not skill:
                self.stdout.write(
                    self.style.WARNING(f"Skill not found: {skill_name}. Skipped.")
                )
                continue

            # C++ gets a unique slug: cpp
            slug = "cpp" if skill.name == "C++" else slugify(skill.name)

            category = AssessmentCategory.objects.filter(skill=skill).first()

            if category is None:
                category = AssessmentCategory.objects.filter(slug=slug).first()

            if category:
                         # Reuse existing category and connect it to the skill
                category.skill = skill
                category.name = skill.name
                category.description = f"Test your {skill.name} knowledge."
                category.level = "Beginner to Advanced"
                category.duration = "10-15 minutes"
                category.is_active = True
                category.save()

            else:
                      # Create a new category only when no matching category exists
                category = AssessmentCategory.objects.create(
                skill=skill,
        name=skill.name,
        slug=slug,
        description=f"Test your {skill.name} knowledge.",
        level="Beginner to Advanced",
        duration="10-15 minutes",
        is_active=True,
    )


            for order, item in enumerate(questions, start=1):
                question, created = AssessmentQuestion.objects.update_or_create(
                    category=category,
                    order=order,
                    defaults={
                        "question": item[0],
                        "options": item[1],
                        "correct_answer": item[2],
                        "explanation": item[3],
                        "is_active": True,
                    },
                )

                if created:
                    created_questions += 1
                else:
                    updated_questions += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"{skill.name}: {len(questions)} questions saved."
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. Created: {created_questions}, "
                f"Updated: {updated_questions}"
            )
        )
