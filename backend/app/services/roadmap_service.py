import logging
from app.exceptions import NotFoundException

logger = logging.getLogger(__name__)

ROADMAPS: dict[str, dict] = {
    "python": {
        "language": "Python",
        "title": "Python Developer Roadmap",
        "description": "A comprehensive path from Python beginner to advanced developer. Covers fundamentals, OOP, data structures, web development, and AI/ML.",
        "sections": [
            {
                "id": "fundamentals",
                "title": "Python Fundamentals",
                "description": "Core building blocks every Python developer must master.",
                "icon": "🧱",
                "topics": [
                    {"id": "py-variables", "title": "Variables & Data Types", "description": "int, float, str, bool, None — how Python stores data"},
                    {"id": "py-operators", "title": "Operators & Expressions", "description": "Arithmetic, comparison, logical, bitwise, and assignment operators"},
                    {"id": "py-strings", "title": "String Operations", "description": "Slicing, formatting, f-strings, and common string methods"},
                    {"id": "py-io", "title": "Input / Output", "description": "print(), input(), file I/O basics"},
                    {"id": "py-conditionals", "title": "Conditionals (if/elif/else)", "description": "Decision-making with branching logic"},
                    {"id": "py-loops", "title": "Loops (for, while)", "description": "Iteration, range(), break, continue, and loop patterns"},
                    {"id": "py-type-casting", "title": "Type Casting & Conversion", "description": "Converting between data types safely"},
                ],
            },
            {
                "id": "data-structures",
                "title": "Data Structures",
                "description": "Python's built-in collections and when to use each one.",
                "icon": "📦",
                "topics": [
                    {"id": "py-lists", "title": "Lists", "description": "Ordered, mutable sequences — indexing, slicing, list comprehensions"},
                    {"id": "py-tuples", "title": "Tuples", "description": "Immutable sequences — packing, unpacking, named tuples"},
                    {"id": "py-dicts", "title": "Dictionaries", "description": "Key-value pairs — CRUD operations, dict comprehensions"},
                    {"id": "py-sets", "title": "Sets & Frozensets", "description": "Unordered unique collections — union, intersection, difference"},
                    {"id": "py-stacks-queues", "title": "Stacks, Queues & Deques", "description": "LIFO/FIFO patterns using collections.deque"},
                    {"id": "py-comprehensions", "title": "Comprehensions", "description": "List, dict, set, and generator comprehensions"},
                ],
            },
            {
                "id": "functions",
                "title": "Functions & Functional Programming",
                "description": "Writing reusable, composable code with functions.",
                "icon": "⚙️",
                "topics": [
                    {"id": "py-functions-basics", "title": "Defining Functions", "description": "def, return, parameters, default values, docstrings"},
                    {"id": "py-args-kwargs", "title": "*args and **kwargs", "description": "Variable-length argument lists and keyword arguments"},
                    {"id": "py-lambda", "title": "Lambda Functions", "description": "Anonymous inline functions and when to use them"},
                    {"id": "py-map-filter-reduce", "title": "map, filter, reduce", "description": "Functional programming patterns for data transformation"},
                    {"id": "py-decorators", "title": "Decorators", "description": "Function wrappers for cross-cutting concerns"},
                    {"id": "py-closures", "title": "Closures & Scope", "description": "LEGB rule, nonlocal, and closure patterns"},
                    {"id": "py-generators", "title": "Generators & yield", "description": "Lazy evaluation with generator functions and expressions"},
                ],
            },
            {
                "id": "oop",
                "title": "Object-Oriented Programming",
                "description": "Modeling real-world concepts with classes and objects.",
                "icon": "🏗️",
                "topics": [
                    {"id": "py-classes", "title": "Classes & Objects", "description": "Defining classes, __init__, instance vs class attributes"},
                    {"id": "py-inheritance", "title": "Inheritance & MRO", "description": "Single, multiple inheritance, super(), method resolution order"},
                    {"id": "py-encapsulation", "title": "Encapsulation", "description": "Public, protected, private attributes and name mangling"},
                    {"id": "py-polymorphism", "title": "Polymorphism", "description": "Duck typing, method overriding, and abstract base classes"},
                    {"id": "py-magic-methods", "title": "Magic / Dunder Methods", "description": "__str__, __repr__, __eq__, __len__, __getitem__ and more"},
                    {"id": "py-dataclasses", "title": "Dataclasses", "description": "Simplified class creation with @dataclass decorator"},
                ],
            },
            {
                "id": "error-handling",
                "title": "Error Handling & Debugging",
                "description": "Writing robust code that handles failure gracefully.",
                "icon": "🛡️",
                "topics": [
                    {"id": "py-try-except", "title": "try / except / finally", "description": "Exception handling fundamentals and best practices"},
                    {"id": "py-custom-exceptions", "title": "Custom Exceptions", "description": "Defining domain-specific exception hierarchies"},
                    {"id": "py-assertions", "title": "Assertions & Debugging", "description": "assert statements, pdb, and debugging strategies"},
                    {"id": "py-logging", "title": "Logging", "description": "Python logging module — levels, handlers, formatters"},
                ],
            },
            {
                "id": "modules-packages",
                "title": "Modules, Packages & Environments",
                "description": "Organizing code and managing dependencies.",
                "icon": "📁",
                "topics": [
                    {"id": "py-modules", "title": "Modules & Imports", "description": "import, from...import, __name__, __main__"},
                    {"id": "py-packages", "title": "Packages & __init__.py", "description": "Structuring multi-file Python projects"},
                    {"id": "py-pip-venv", "title": "pip & Virtual Environments", "description": "Dependency management with pip, venv, and requirements.txt"},
                    {"id": "py-stdlib", "title": "Standard Library Highlights", "description": "os, sys, json, datetime, re, pathlib, itertools, functools"},
                ],
            },
            {
                "id": "file-handling",
                "title": "File Handling & Serialization",
                "description": "Reading, writing, and processing data from files.",
                "icon": "📄",
                "topics": [
                    {"id": "py-file-io", "title": "File Read / Write", "description": "open(), with statement, read modes, encoding"},
                    {"id": "py-csv-json", "title": "CSV & JSON Processing", "description": "csv module, json.loads/dumps, real-world data parsing"},
                    {"id": "py-pathlib", "title": "pathlib & os.path", "description": "Cross-platform file path handling"},
                ],
            },
            {
                "id": "advanced",
                "title": "Advanced Python",
                "description": "Deeper concepts for writing professional-grade Python.",
                "icon": "🚀",
                "topics": [
                    {"id": "py-iterators", "title": "Iterators & Itertools", "description": "Iterator protocol, custom iterators, itertools recipes"},
                    {"id": "py-context-managers", "title": "Context Managers", "description": "with statement, __enter__/__exit__, contextlib"},
                    {"id": "py-metaclasses", "title": "Metaclasses", "description": "type(), __new__, __init_subclass__, class creation hooks"},
                    {"id": "py-descriptors", "title": "Descriptors & Properties", "description": "@property, __get__/__set__/__delete__"},
                    {"id": "py-concurrency", "title": "Concurrency (Threading & Asyncio)", "description": "threading, multiprocessing, async/await, GIL"},
                    {"id": "py-type-hints", "title": "Type Hints & Mypy", "description": "Static typing with annotations, generics, Protocol"},
                ],
            },
            {
                "id": "web-dev",
                "title": "Web Development",
                "description": "Building web applications and APIs with Python.",
                "icon": "🌐",
                "topics": [
                    {"id": "py-fastapi", "title": "FastAPI", "description": "Modern async API framework — routing, Pydantic, dependency injection"},
                    {"id": "py-flask", "title": "Flask", "description": "Lightweight web framework — blueprints, Jinja2, extensions"},
                    {"id": "py-django", "title": "Django", "description": "Full-stack framework — ORM, admin, auth, REST framework"},
                    {"id": "py-rest-apis", "title": "REST API Design", "description": "HTTP methods, status codes, authentication, versioning"},
                    {"id": "py-databases", "title": "Database Integration", "description": "SQLAlchemy, MongoDB (motor), Redis, connection pooling"},
                ],
            },
            {
                "id": "ai-ml",
                "title": "AI / Machine Learning",
                "description": "Applying Python to data science and artificial intelligence.",
                "icon": "🤖",
                "topics": [
                    {"id": "py-numpy", "title": "NumPy", "description": "N-dimensional arrays, broadcasting, linear algebra"},
                    {"id": "py-pandas", "title": "Pandas", "description": "DataFrames, data cleaning, groupby, merging, time series"},
                    {"id": "py-matplotlib", "title": "Matplotlib & Seaborn", "description": "Data visualization — plots, charts, styling"},
                    {"id": "py-scikit", "title": "Scikit-learn", "description": "ML pipelines — classification, regression, clustering, evaluation"},
                    {"id": "py-tensorflow", "title": "TensorFlow / PyTorch", "description": "Deep learning frameworks — neural networks, training loops"},
                    {"id": "py-llm", "title": "LLM & Generative AI", "description": "Working with OpenAI, LangChain, vector databases, RAG"},
                ],
            },
        ],
    },
    "javascript": {
        "language": "JavaScript",
        "title": "JavaScript Developer Roadmap",
        "description": "From JS fundamentals to full-stack development with Node.js and React. Covers ES6+, async patterns, and modern tooling.",
        "sections": [
            {
                "id": "js-fundamentals",
                "title": "JavaScript Fundamentals",
                "description": "Core language features every JS developer needs.",
                "icon": "🧱",
                "topics": [
                    {"id": "js-variables", "title": "Variables (let, const, var)", "description": "Declaration, scoping rules, hoisting, temporal dead zone"},
                    {"id": "js-data-types", "title": "Data Types & Coercion", "description": "Primitives, objects, typeof, == vs ===, type coercion rules"},
                    {"id": "js-strings", "title": "Strings & Template Literals", "description": "String methods, template literals, tagged templates"},
                    {"id": "js-conditionals", "title": "Conditionals & Ternary", "description": "if/else, switch, ternary operator, nullish coalescing"},
                    {"id": "js-loops", "title": "Loops & Iteration", "description": "for, for...of, for...in, while, do...while"},
                    {"id": "js-operators", "title": "Operators", "description": "Spread, rest, destructuring, optional chaining, logical assignment"},
                ],
            },
            {
                "id": "js-functions",
                "title": "Functions & Scope",
                "description": "First-class functions and execution context.",
                "icon": "⚙️",
                "topics": [
                    {"id": "js-function-decl", "title": "Function Declarations & Expressions", "description": "Named functions, arrow functions, IIFE, hoisting"},
                    {"id": "js-closures", "title": "Closures", "description": "Lexical scope, closure patterns, data privacy"},
                    {"id": "js-this", "title": "this Keyword", "description": "Binding rules — default, implicit, explicit, new, arrow functions"},
                    {"id": "js-callbacks", "title": "Callbacks", "description": "Callback patterns, callback hell, error-first convention"},
                    {"id": "js-hof", "title": "Higher-Order Functions", "description": "map, filter, reduce, sort, every, some, find"},
                ],
            },
            {
                "id": "js-objects",
                "title": "Objects & Prototypes",
                "description": "JavaScript's prototype-based OOP model.",
                "icon": "🏗️",
                "topics": [
                    {"id": "js-objects-basics", "title": "Objects & Methods", "description": "Object literals, computed properties, shorthand, methods"},
                    {"id": "js-prototypes", "title": "Prototypes & Inheritance", "description": "Prototype chain, Object.create, __proto__ vs prototype"},
                    {"id": "js-classes", "title": "ES6 Classes", "description": "class syntax, constructor, extends, super, static methods"},
                    {"id": "js-destructuring", "title": "Destructuring & Spread", "description": "Object/array destructuring, rest/spread, deep cloning"},
                ],
            },
            {
                "id": "js-async",
                "title": "Asynchronous JavaScript",
                "description": "Handling async operations — the heart of modern JS.",
                "icon": "⏳",
                "topics": [
                    {"id": "js-event-loop", "title": "Event Loop & Call Stack", "description": "How JS executes code — microtasks, macrotasks, task queue"},
                    {"id": "js-promises", "title": "Promises", "description": "Promise constructor, then/catch/finally, chaining, Promise.all"},
                    {"id": "js-async-await", "title": "async / await", "description": "Syntactic sugar for promises, error handling, parallel execution"},
                    {"id": "js-fetch", "title": "Fetch API & HTTP", "description": "fetch(), request/response, headers, JSON, error handling"},
                ],
            },
            {
                "id": "js-dom",
                "title": "DOM & Browser APIs",
                "description": "Manipulating the web page and using browser capabilities.",
                "icon": "🌐",
                "topics": [
                    {"id": "js-dom-selection", "title": "DOM Selection & Manipulation", "description": "querySelector, createElement, innerHTML, classList"},
                    {"id": "js-events", "title": "Events & Event Delegation", "description": "addEventListener, bubbling, capturing, event delegation patterns"},
                    {"id": "js-storage", "title": "Web Storage & Cookies", "description": "localStorage, sessionStorage, cookies, IndexedDB"},
                ],
            },
            {
                "id": "js-es6-plus",
                "title": "ES6+ Modern Features",
                "description": "Modern JavaScript features that power today's codebases.",
                "icon": "✨",
                "topics": [
                    {"id": "js-modules", "title": "ES Modules", "description": "import/export, default exports, dynamic imports, module patterns"},
                    {"id": "js-iterators", "title": "Iterators & Generators", "description": "Symbol.iterator, generator functions, yield, for...of"},
                    {"id": "js-proxy-reflect", "title": "Proxy & Reflect", "description": "Metaprogramming — traps, handler, reactive patterns"},
                    {"id": "js-map-set", "title": "Map, Set, WeakMap, WeakSet", "description": "Modern collection types and their use cases"},
                    {"id": "js-symbols", "title": "Symbols", "description": "Unique identifiers, well-known symbols, Symbol.iterator"},
                ],
            },
            {
                "id": "js-react",
                "title": "React & Frontend Frameworks",
                "description": "Building modern user interfaces.",
                "icon": "⚛️",
                "topics": [
                    {"id": "js-react-basics", "title": "React Fundamentals", "description": "JSX, components, props, state, rendering"},
                    {"id": "js-hooks", "title": "React Hooks", "description": "useState, useEffect, useRef, useMemo, custom hooks"},
                    {"id": "js-nextjs", "title": "Next.js", "description": "SSR, SSG, App Router, API routes, middleware"},
                    {"id": "js-state-mgmt", "title": "State Management", "description": "Context API, Zustand, Redux Toolkit, Jotai"},
                ],
            },
            {
                "id": "js-node",
                "title": "Node.js & Backend",
                "description": "Server-side JavaScript development.",
                "icon": "🖥️",
                "topics": [
                    {"id": "js-node-basics", "title": "Node.js Fundamentals", "description": "Runtime, modules, npm, event-driven architecture"},
                    {"id": "js-express", "title": "Express.js", "description": "Routing, middleware, error handling, REST APIs"},
                    {"id": "js-db", "title": "Database Integration", "description": "MongoDB (Mongoose), PostgreSQL (Prisma), Redis"},
                    {"id": "js-auth", "title": "Authentication", "description": "JWT, OAuth, session-based auth, bcrypt, passport.js"},
                ],
            },
        ],
    },
    "machine-learning": {
        "language": "Machine Learning",
        "title": "Machine Learning Roadmap",
        "description": "From math foundations to deploying production ML systems. Covers statistics, classical algorithms, deep learning, and MLOps.",
        "sections": [
            {
                "id": "ml-math",
                "title": "Math Foundations",
                "description": "The mathematical backbone of every ML algorithm.",
                "icon": "📐",
                "topics": [
                    {"id": "ml-linear-algebra", "title": "Linear Algebra", "description": "Vectors, matrices, eigenvalues, SVD, matrix decomposition"},
                    {"id": "ml-calculus", "title": "Calculus & Optimization", "description": "Derivatives, gradients, chain rule, gradient descent, convexity"},
                    {"id": "ml-probability", "title": "Probability & Statistics", "description": "Distributions, Bayes theorem, MLE, hypothesis testing, confidence intervals"},
                    {"id": "ml-info-theory", "title": "Information Theory", "description": "Entropy, KL divergence, cross-entropy, mutual information"},
                ],
            },
            {
                "id": "ml-data",
                "title": "Data Preprocessing",
                "description": "Preparing raw data for ML models.",
                "icon": "🧹",
                "topics": [
                    {"id": "ml-eda", "title": "Exploratory Data Analysis", "description": "Visualization, distributions, correlations, outlier detection"},
                    {"id": "ml-cleaning", "title": "Data Cleaning", "description": "Missing values, duplicates, inconsistencies, data validation"},
                    {"id": "ml-feature-eng", "title": "Feature Engineering", "description": "Encoding, scaling, binning, polynomial features, domain features"},
                    {"id": "ml-feature-sel", "title": "Feature Selection", "description": "Filter, wrapper, embedded methods, PCA, variance threshold"},
                    {"id": "ml-splitting", "title": "Train / Val / Test Splits", "description": "Holdout, k-fold cross-validation, stratification, time-series splits"},
                ],
            },
            {
                "id": "ml-supervised",
                "title": "Supervised Learning",
                "description": "Learning from labeled data to make predictions.",
                "icon": "🎯",
                "topics": [
                    {"id": "ml-linear-reg", "title": "Linear Regression", "description": "OLS, regularization (Ridge, Lasso, ElasticNet), assumptions"},
                    {"id": "ml-logistic-reg", "title": "Logistic Regression", "description": "Binary/multiclass classification, sigmoid, decision boundary"},
                    {"id": "ml-decision-trees", "title": "Decision Trees", "description": "Splitting criteria (Gini, entropy), pruning, feature importance"},
                    {"id": "ml-random-forest", "title": "Random Forests", "description": "Bagging, feature randomness, out-of-bag error, hyperparameters"},
                    {"id": "ml-gradient-boost", "title": "Gradient Boosting (XGBoost, LightGBM)", "description": "Boosting theory, learning rate, early stopping, SHAP values"},
                    {"id": "ml-svm", "title": "Support Vector Machines", "description": "Kernel trick, margin maximization, soft margins, SVR"},
                    {"id": "ml-knn", "title": "K-Nearest Neighbors", "description": "Distance metrics, curse of dimensionality, weighted KNN"},
                    {"id": "ml-naive-bayes", "title": "Naive Bayes", "description": "Gaussian, Multinomial, Bernoulli variants, text classification"},
                ],
            },
            {
                "id": "ml-unsupervised",
                "title": "Unsupervised Learning",
                "description": "Finding patterns in unlabeled data.",
                "icon": "🔍",
                "topics": [
                    {"id": "ml-kmeans", "title": "K-Means Clustering", "description": "Centroid initialization, elbow method, silhouette score"},
                    {"id": "ml-hierarchical", "title": "Hierarchical Clustering", "description": "Agglomerative, dendrograms, linkage methods"},
                    {"id": "ml-dbscan", "title": "DBSCAN", "description": "Density-based clustering, eps, min_samples, noise handling"},
                    {"id": "ml-pca", "title": "PCA & Dimensionality Reduction", "description": "Variance explained, scree plots, t-SNE, UMAP"},
                    {"id": "ml-anomaly", "title": "Anomaly Detection", "description": "Isolation Forest, One-Class SVM, autoencoders"},
                ],
            },
            {
                "id": "ml-evaluation",
                "title": "Model Evaluation & Tuning",
                "description": "Measuring and improving model performance.",
                "icon": "📊",
                "topics": [
                    {"id": "ml-metrics-class", "title": "Classification Metrics", "description": "Accuracy, precision, recall, F1, ROC-AUC, confusion matrix"},
                    {"id": "ml-metrics-reg", "title": "Regression Metrics", "description": "MSE, RMSE, MAE, R², adjusted R², MAPE"},
                    {"id": "ml-bias-variance", "title": "Bias-Variance Tradeoff", "description": "Underfitting, overfitting, learning curves, regularization"},
                    {"id": "ml-hyperparam", "title": "Hyperparameter Tuning", "description": "Grid search, random search, Bayesian optimization, Optuna"},
                    {"id": "ml-cross-val", "title": "Cross-Validation Strategies", "description": "K-fold, stratified, leave-one-out, time series CV"},
                ],
            },
            {
                "id": "ml-ensemble",
                "title": "Ensemble Methods",
                "description": "Combining models for better performance.",
                "icon": "🤝",
                "topics": [
                    {"id": "ml-bagging", "title": "Bagging", "description": "Bootstrap aggregation, variance reduction, parallel training"},
                    {"id": "ml-boosting", "title": "Boosting", "description": "AdaBoost, Gradient Boosting, sequential learning, bias reduction"},
                    {"id": "ml-stacking", "title": "Stacking & Blending", "description": "Meta-learners, multi-level ensembles, competition techniques"},
                ],
            },
            {
                "id": "ml-deployment",
                "title": "MLOps & Deployment",
                "description": "Taking models from notebook to production.",
                "icon": "🚀",
                "topics": [
                    {"id": "ml-pipelines", "title": "ML Pipelines", "description": "Scikit-learn Pipeline, feature transformers, end-to-end workflows"},
                    {"id": "ml-experiment", "title": "Experiment Tracking", "description": "MLflow, Weights & Biases, experiment logging, model registry"},
                    {"id": "ml-serving", "title": "Model Serving", "description": "FastAPI, Flask, TensorFlow Serving, ONNX, batch vs real-time"},
                    {"id": "ml-monitoring", "title": "Model Monitoring", "description": "Data drift, concept drift, performance degradation, retraining"},
                    {"id": "ml-version", "title": "Data & Model Versioning", "description": "DVC, model registries, reproducibility, lineage tracking"},
                ],
            },
        ],
    },
    "deep-learning": {
        "language": "Deep Learning",
        "title": "Deep Learning Roadmap",
        "description": "From neural network fundamentals to state-of-the-art architectures. Covers CNNs, RNNs, Transformers, GANs, and training techniques.",
        "sections": [
            {
                "id": "dl-foundations",
                "title": "Neural Network Foundations",
                "description": "Core concepts behind every deep learning model.",
                "icon": "🧠",
                "topics": [
                    {"id": "dl-perceptron", "title": "Perceptron & Neurons", "description": "Biological inspiration, weights, bias, activation functions"},
                    {"id": "dl-activations", "title": "Activation Functions", "description": "ReLU, Sigmoid, Tanh, Leaky ReLU, GELU, Swish — when to use each"},
                    {"id": "dl-feedforward", "title": "Feedforward Networks (MLP)", "description": "Layers, hidden units, universal approximation theorem"},
                    {"id": "dl-backprop", "title": "Backpropagation", "description": "Chain rule, computational graphs, gradient flow"},
                    {"id": "dl-loss-functions", "title": "Loss Functions", "description": "Cross-entropy, MSE, Hinge, Focal Loss, contrastive loss"},
                ],
            },
            {
                "id": "dl-training",
                "title": "Training Deep Networks",
                "description": "Techniques for training neural networks effectively.",
                "icon": "⚡",
                "topics": [
                    {"id": "dl-optimizers", "title": "Optimizers", "description": "SGD, Adam, AdamW, RMSprop, learning rate schedules"},
                    {"id": "dl-regularization", "title": "Regularization", "description": "Dropout, weight decay, batch norm, layer norm, early stopping"},
                    {"id": "dl-init", "title": "Weight Initialization", "description": "Xavier, He, orthogonal initialization, why it matters"},
                    {"id": "dl-batch-norm", "title": "Batch & Layer Normalization", "description": "Internal covariate shift, normalization techniques, Group Norm"},
                    {"id": "dl-lr-schedule", "title": "Learning Rate Scheduling", "description": "Step decay, cosine annealing, warmup, cyclical LR, one-cycle"},
                    {"id": "dl-mixed-precision", "title": "Mixed Precision Training", "description": "FP16, loss scaling, automatic mixed precision, memory savings"},
                ],
            },
            {
                "id": "dl-cnn",
                "title": "Convolutional Neural Networks",
                "description": "The backbone of computer vision.",
                "icon": "👁️",
                "topics": [
                    {"id": "dl-convolution", "title": "Convolution Operation", "description": "Filters, stride, padding, feature maps, receptive field"},
                    {"id": "dl-pooling", "title": "Pooling Layers", "description": "Max pooling, average pooling, global pooling, spatial reduction"},
                    {"id": "dl-architectures", "title": "Classic Architectures", "description": "LeNet, AlexNet, VGG, ResNet, Inception, EfficientNet"},
                    {"id": "dl-object-detect", "title": "Object Detection", "description": "YOLO, SSD, Faster R-CNN, anchor boxes, NMS"},
                    {"id": "dl-segmentation", "title": "Image Segmentation", "description": "U-Net, Mask R-CNN, semantic vs instance segmentation"},
                    {"id": "dl-transfer", "title": "Transfer Learning", "description": "Pretrained models, fine-tuning, feature extraction, domain adaptation"},
                ],
            },
            {
                "id": "dl-rnn",
                "title": "Recurrent Neural Networks",
                "description": "Processing sequential data.",
                "icon": "🔄",
                "topics": [
                    {"id": "dl-rnn-basics", "title": "RNN Fundamentals", "description": "Hidden state, sequence modeling, vanishing gradient problem"},
                    {"id": "dl-lstm", "title": "LSTM", "description": "Gates (forget, input, output), cell state, long-term dependencies"},
                    {"id": "dl-gru", "title": "GRU", "description": "Simplified gating, reset/update gates, LSTM vs GRU tradeoffs"},
                    {"id": "dl-seq2seq", "title": "Seq2Seq & Attention", "description": "Encoder-decoder, Bahdanau attention, teacher forcing"},
                ],
            },
            {
                "id": "dl-transformers",
                "title": "Transformers",
                "description": "The architecture revolutionizing all of AI.",
                "icon": "🔮",
                "topics": [
                    {"id": "dl-self-attention", "title": "Self-Attention Mechanism", "description": "Query, Key, Value, scaled dot-product, multi-head attention"},
                    {"id": "dl-positional", "title": "Positional Encoding", "description": "Sinusoidal, learned, rotary (RoPE), ALiBi"},
                    {"id": "dl-transformer-arch", "title": "Transformer Architecture", "description": "Encoder-decoder, layer norms, residual connections, feed-forward"},
                    {"id": "dl-bert", "title": "BERT & Encoder Models", "description": "Masked language modeling, fine-tuning, sentence embeddings"},
                    {"id": "dl-gpt", "title": "GPT & Decoder Models", "description": "Autoregressive generation, causal masking, scaling laws"},
                    {"id": "dl-vit", "title": "Vision Transformers (ViT)", "description": "Patch embeddings, image classification, DeiT, Swin Transformer"},
                ],
            },
            {
                "id": "dl-generative",
                "title": "Generative Models",
                "description": "Models that create new data.",
                "icon": "🎨",
                "topics": [
                    {"id": "dl-autoencoders", "title": "Autoencoders & VAE", "description": "Encoder-decoder, latent space, variational inference, KL divergence"},
                    {"id": "dl-gans", "title": "GANs", "description": "Generator, discriminator, training dynamics, mode collapse, WGAN"},
                    {"id": "dl-diffusion", "title": "Diffusion Models", "description": "Forward/reverse process, DDPM, noise schedules, Stable Diffusion"},
                ],
            },
            {
                "id": "dl-frameworks",
                "title": "Frameworks & Tools",
                "description": "Production deep learning tooling.",
                "icon": "🛠️",
                "topics": [
                    {"id": "dl-pytorch", "title": "PyTorch", "description": "Tensors, autograd, nn.Module, DataLoader, training loops"},
                    {"id": "dl-tensorflow", "title": "TensorFlow / Keras", "description": "Sequential, Functional API, tf.data, SavedModel, TFLite"},
                    {"id": "dl-huggingface", "title": "Hugging Face Ecosystem", "description": "Transformers, Datasets, Tokenizers, model hub, Trainer API"},
                    {"id": "dl-distributed", "title": "Distributed Training", "description": "Data parallelism, model parallelism, DeepSpeed, FSDP"},
                ],
            },
        ],
    },
    "generative-ai": {
        "language": "Generative AI",
        "title": "Generative AI Roadmap",
        "description": "Master the technology behind ChatGPT, Midjourney, and modern AI assistants. Covers LLMs, prompt engineering, RAG, fine-tuning, and AI agents.",
        "sections": [
            {
                "id": "genai-foundations",
                "title": "GenAI Foundations",
                "description": "Core concepts powering generative AI.",
                "icon": "🧱",
                "topics": [
                    {"id": "genai-what", "title": "What is Generative AI?", "description": "Discriminative vs generative models, history, capabilities and limits"},
                    {"id": "genai-llm-basics", "title": "How LLMs Work", "description": "Tokenization, embeddings, attention, next-token prediction, temperature"},
                    {"id": "genai-models", "title": "Key Models & Companies", "description": "GPT-4, Claude, Gemini, LLaMA, Mistral — capabilities comparison"},
                    {"id": "genai-tokens", "title": "Tokenization Deep Dive", "description": "BPE, SentencePiece, token limits, cost implications"},
                ],
            },
            {
                "id": "genai-prompting",
                "title": "Prompt Engineering",
                "description": "The art and science of talking to AI.",
                "icon": "💬",
                "topics": [
                    {"id": "genai-basic-prompt", "title": "Basic Prompting Techniques", "description": "Clear instructions, role assignment, output formatting"},
                    {"id": "genai-few-shot", "title": "Few-Shot & Zero-Shot", "description": "In-context learning, example selection, formatting patterns"},
                    {"id": "genai-cot", "title": "Chain-of-Thought Prompting", "description": "Step-by-step reasoning, self-consistency, tree of thought"},
                    {"id": "genai-system-prompts", "title": "System Prompts & Personas", "description": "Setting behavior, constraints, output format, guardrails"},
                    {"id": "genai-prompt-patterns", "title": "Advanced Patterns", "description": "ReAct, self-reflection, meta-prompting, prompt chaining"},
                ],
            },
            {
                "id": "genai-apis",
                "title": "Working with AI APIs",
                "description": "Integrating LLMs into applications.",
                "icon": "🔌",
                "topics": [
                    {"id": "genai-openai-api", "title": "OpenAI API", "description": "Chat completions, function calling, streaming, vision, embeddings"},
                    {"id": "genai-anthropic-api", "title": "Anthropic Claude API", "description": "Messages API, system prompts, tool use, long context"},
                    {"id": "genai-google-api", "title": "Google Gemini API", "description": "GenerativeModel, multimodal inputs, safety settings, grounding"},
                    {"id": "genai-streaming", "title": "Streaming & Real-time", "description": "SSE, WebSockets, token-by-token streaming, UX patterns"},
                    {"id": "genai-cost", "title": "Cost Optimization", "description": "Token counting, caching, model selection, batching strategies"},
                ],
            },
            {
                "id": "genai-rag",
                "title": "RAG (Retrieval-Augmented Generation)",
                "description": "Grounding AI responses in your data.",
                "icon": "📚",
                "topics": [
                    {"id": "genai-embeddings", "title": "Text Embeddings", "description": "Embedding models, similarity search, cosine similarity, dimensionality"},
                    {"id": "genai-vector-db", "title": "Vector Databases", "description": "Pinecone, ChromaDB, Weaviate, pgvector — indexing and querying"},
                    {"id": "genai-chunking", "title": "Document Chunking", "description": "Chunk size, overlap, recursive splitting, semantic chunking"},
                    {"id": "genai-rag-pipeline", "title": "RAG Pipeline Architecture", "description": "Ingestion, retrieval, reranking, generation, evaluation"},
                    {"id": "genai-advanced-rag", "title": "Advanced RAG Patterns", "description": "Hybrid search, HyDE, query decomposition, self-RAG, RAPTOR"},
                ],
            },
            {
                "id": "genai-langchain",
                "title": "LangChain & Frameworks",
                "description": "Building LLM-powered applications.",
                "icon": "🔗",
                "topics": [
                    {"id": "genai-langchain-basics", "title": "LangChain Fundamentals", "description": "Chains, prompts, output parsers, memory, LCEL"},
                    {"id": "genai-llamaindex", "title": "LlamaIndex", "description": "Data connectors, indices, query engines, response synthesizers"},
                    {"id": "genai-semantic-kernel", "title": "Semantic Kernel & Others", "description": "Microsoft Semantic Kernel, Haystack, DSPy comparison"},
                    {"id": "genai-structured", "title": "Structured Outputs", "description": "JSON mode, function calling, Pydantic validation, schema enforcement"},
                ],
            },
            {
                "id": "genai-finetuning",
                "title": "Fine-Tuning LLMs",
                "description": "Customizing models for specific tasks.",
                "icon": "🎯",
                "topics": [
                    {"id": "genai-when-finetune", "title": "When to Fine-Tune", "description": "Fine-tuning vs prompting vs RAG decision framework"},
                    {"id": "genai-lora", "title": "LoRA & QLoRA", "description": "Low-rank adaptation, quantization, parameter-efficient fine-tuning"},
                    {"id": "genai-data-prep", "title": "Training Data Preparation", "description": "Instruction formatting, data quality, synthetic data generation"},
                    {"id": "genai-eval", "title": "LLM Evaluation", "description": "Benchmarks, human eval, LLM-as-judge, BLEU, ROUGE, perplexity"},
                ],
            },
            {
                "id": "genai-multimodal",
                "title": "Multimodal AI",
                "description": "Beyond text — images, audio, and video.",
                "icon": "🖼️",
                "topics": [
                    {"id": "genai-image-gen", "title": "Image Generation", "description": "DALL-E, Stable Diffusion, Midjourney, ControlNet, img2img"},
                    {"id": "genai-vision", "title": "Vision-Language Models", "description": "GPT-4V, Claude Vision, LLaVA, image understanding, OCR"},
                    {"id": "genai-audio", "title": "Speech & Audio AI", "description": "Whisper, TTS, voice cloning, real-time transcription"},
                    {"id": "genai-video", "title": "Video Generation", "description": "Sora, Runway, temporal consistency, video understanding"},
                ],
            },
        ],
    },
    "agentic-ai": {
        "language": "Agentic AI",
        "title": "Agentic AI Roadmap",
        "description": "Build autonomous AI agents that reason, plan, use tools, and take actions. Covers agent architectures, tool use, memory systems, and multi-agent orchestration.",
        "sections": [
            {
                "id": "agent-foundations",
                "title": "Agent Foundations",
                "description": "Core concepts of autonomous AI agents.",
                "icon": "🤖",
                "topics": [
                    {"id": "agent-what", "title": "What are AI Agents?", "description": "Agent definition, autonomy levels, agent vs chatbot, cognitive architectures"},
                    {"id": "agent-reasoning", "title": "Reasoning & Planning", "description": "ReAct pattern, chain-of-thought, decomposition, reflection loops"},
                    {"id": "agent-loop", "title": "Agent Loop Architecture", "description": "Observe → Think → Act → Reflect cycle, termination conditions"},
                    {"id": "agent-types", "title": "Types of Agents", "description": "Reactive, deliberative, hybrid, BDI model, utility-based agents"},
                ],
            },
            {
                "id": "agent-tools",
                "title": "Tool Use & Function Calling",
                "description": "Giving agents the ability to interact with the world.",
                "icon": "🔧",
                "topics": [
                    {"id": "agent-function-call", "title": "Function Calling", "description": "OpenAI tools, Claude tool_use, Gemini function declarations"},
                    {"id": "agent-api-tools", "title": "API Integration Tools", "description": "Web search, code execution, database queries, file operations"},
                    {"id": "agent-browser", "title": "Browser & Web Tools", "description": "Web scraping, browser automation, Playwright, headless Chrome"},
                    {"id": "agent-code-exec", "title": "Code Execution", "description": "Sandboxed code interpreters, E2B, Modal, safety considerations"},
                    {"id": "agent-tool-design", "title": "Tool Design Principles", "description": "Tool descriptions, parameter schemas, error handling, tool selection"},
                ],
            },
            {
                "id": "agent-memory",
                "title": "Memory Systems",
                "description": "How agents remember and learn from experience.",
                "icon": "💾",
                "topics": [
                    {"id": "agent-short-memory", "title": "Short-Term Memory", "description": "Conversation context, sliding window, summarization strategies"},
                    {"id": "agent-long-memory", "title": "Long-Term Memory", "description": "Vector stores, knowledge graphs, episodic memory, retrieval"},
                    {"id": "agent-working-memory", "title": "Working Memory & Scratchpad", "description": "Intermediate reasoning, state tracking, structured scratchpads"},
                    {"id": "agent-learning", "title": "Agent Learning & Adaptation", "description": "Experience replay, self-improvement, feedback incorporation"},
                ],
            },
            {
                "id": "agent-frameworks",
                "title": "Agent Frameworks",
                "description": "Tools and libraries for building agents.",
                "icon": "🏗️",
                "topics": [
                    {"id": "agent-langchain-agents", "title": "LangChain Agents", "description": "AgentExecutor, tool binding, structured chat, custom agents"},
                    {"id": "agent-langgraph", "title": "LangGraph", "description": "Stateful graphs, cycles, conditional edges, persistence, streaming"},
                    {"id": "agent-crewai", "title": "CrewAI", "description": "Role-based agents, tasks, crews, delegation, process flows"},
                    {"id": "agent-autogen", "title": "AutoGen", "description": "Conversational agents, group chat, code generation, human-in-loop"},
                    {"id": "agent-claude-sdk", "title": "Claude Agent SDK", "description": "Anthropic's agent SDK, tool use patterns, multi-turn orchestration"},
                ],
            },
            {
                "id": "agent-multi",
                "title": "Multi-Agent Systems",
                "description": "Orchestrating multiple agents working together.",
                "icon": "👥",
                "topics": [
                    {"id": "agent-orchestration", "title": "Agent Orchestration", "description": "Supervisor patterns, hierarchical agents, routing, delegation"},
                    {"id": "agent-communication", "title": "Inter-Agent Communication", "description": "Message passing, shared memory, blackboard systems, protocols"},
                    {"id": "agent-specialization", "title": "Agent Specialization", "description": "Role assignment, expert agents, division of labor, skill matching"},
                    {"id": "agent-consensus", "title": "Consensus & Conflict Resolution", "description": "Voting, debate, aggregation, handling contradictions"},
                ],
            },
            {
                "id": "agent-advanced",
                "title": "Advanced Patterns",
                "description": "Cutting-edge agent architectures and techniques.",
                "icon": "🚀",
                "topics": [
                    {"id": "agent-self-reflect", "title": "Self-Reflection & Critique", "description": "Reflexion, self-evaluation, iterative refinement, confidence scoring"},
                    {"id": "agent-planning", "title": "Task Decomposition & Planning", "description": "Plan-and-solve, hierarchical planning, dynamic replanning"},
                    {"id": "agent-rag-agents", "title": "RAG-Augmented Agents", "description": "Agentic RAG, dynamic retrieval, query routing, corrective RAG"},
                    {"id": "agent-human-loop", "title": "Human-in-the-Loop", "description": "Approval workflows, escalation, feedback loops, guardrails"},
                    {"id": "agent-eval", "title": "Agent Evaluation", "description": "Task completion rate, trajectory analysis, cost efficiency, benchmarks"},
                ],
            },
            {
                "id": "agent-production",
                "title": "Production Deployment",
                "description": "Running agents safely in production.",
                "icon": "🛡️",
                "topics": [
                    {"id": "agent-safety", "title": "Safety & Guardrails", "description": "Input/output validation, action limits, sandboxing, kill switches"},
                    {"id": "agent-observability", "title": "Observability & Tracing", "description": "LangSmith, Arize, trace logging, cost tracking, latency monitoring"},
                    {"id": "agent-scaling", "title": "Scaling Agents", "description": "Async execution, queues, rate limiting, caching, cost optimization"},
                    {"id": "agent-security", "title": "Security Considerations", "description": "Prompt injection, tool abuse, data exfiltration, permission models"},
                ],
            },
        ],
    },
}


def get_roadmap(language: str) -> dict:
    """Retrieve the roadmap for a given programming language."""
    key = language.lower().strip()
    roadmap = ROADMAPS.get(key)

    if not roadmap:
        available = ", ".join(ROADMAPS.keys())
        raise NotFoundException(
            detail=f"Roadmap for '{language}' not found. Available: {available}"
        )

    total = sum(len(s["topics"]) for s in roadmap["sections"])
    logger.info("Roadmap loaded: %s (%d sections, %d topics)", language, len(roadmap["sections"]), total)

    return {**roadmap, "total_topics": total}


def get_available_languages() -> list[dict]:
    """Return a list of available roadmap languages with metadata."""
    result = []
    for key, rm in ROADMAPS.items():
        total = sum(len(s["topics"]) for s in rm["sections"])
        result.append({
            "id": key,
            "language": rm["language"],
            "title": rm["title"],
            "description": rm["description"],
            "sections_count": len(rm["sections"]),
            "topics_count": total,
        })
    return result
