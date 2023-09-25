# Accelerator
# Environment Setup

Install conda

```shell
conda create -n accelerator
```

Activate

```shell
conda activate accelerator
```

In order to set your environment up to run the code here, first install all requirements:

```shell
pip install -r requirements.txt
```

# Run the UI
1. Open up a terminal and activate your python environment that contains the dependencies installed from requirements.txt.

2. Navigate to the `/ACCELERATOR` directory.

3. Run the following command `python app.py`. The API should being to run.

4. Wait until everything has loaded in. You should see something like `INFO:werkzeug:Press CTRL+C to quit`.

5. Open up a web browser and go the address `http://localhost:5003/`.

# Run the Server
1. Open up a terminal and activate your python environment that contains the dependencies installed from requirements.txt.

2. Navigate to the `/ACCELERATOR` directory.

3. Run the following command `python server.py`. The API should being to run.

4. Wait until everything has loaded in. You should see something like `INFO:werkzeug:Press CTRL+C to quit`.

5. Open `example.py` in an editor of your choice and modify the data according to requirment and run it.

# Set Open API Key 

## For Windows 10/11
Set the environment variable using the Command Prompt:

```shell
setx OPENAI_API_KEY "Your_API_KEY"
```

## For macOS and Linux
Set the environment variable using the Terminal:

```shell
export OPENAI_API_KEY "Your_API_KEY"
```
### NOTE:
After setting the environment variable, you should restart your Python script or System for it to take effect.

# System Requirements

## Python Version

To use this software, you must have Python 3.10 or later installed. Earlier versions of Python will not compile.

## C++ Compiler

If you encounter an error while building a wheel during the `pip install` process, you may need to install a C++ compiler on your computer.

### For Windows 10/11

To install a C++ compiler on Windows 10/11, follow these steps:

1. Install Visual Studio 2022.
2. Make sure the following components are selected:
   - Universal Windows Platform development
   - C++ CMake tools for Windows
3. Download the MinGW installer from the [MinGW website](https://sourceforge.net/projects/mingw/).
4. Run the installer and select the "gcc" component.
