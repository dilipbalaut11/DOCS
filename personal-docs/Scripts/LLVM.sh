1. Download Cmake
https://cmake.org/download/

2. Compile CMake
./bootstrap;make;make install;

3. Download LLVM src
http://releases.llvm.org/download.html#3.9.0

4. Compile Sphinx
https://sourceforge.net/projects/cmusphinx/?source=typ_redirect
python setup.py build
python setup.py 


5. Compile LLVM with CMake
mkdir build;cd build

cmake -DLLVM_ENABLE_SPHINX=true -DSPHINX_OUTPUT_HTML=true /home/dilip/work/pg_codes/LLVM/llvm-3.9.0.src/

make; make install

5.