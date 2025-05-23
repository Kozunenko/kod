#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
namespace py = pybind11;

std::vector<int> apply_filter_cpp(std::vector<int> data, int width, int height, std::string filter_name) {
    if (filter_name == "invert") {
        for (size_t i = 0; i < data.size(); i += 4) {
            data[i] = 255 - data[i];       // R
            data[i+1] = 255 - data[i+1];   // G
            data[i+2] = 255 - data[i+2];   // B
            // Alpha (data[i+3]) залишаємо без змін
        }
    }
    return data;
}

PYBIND11_MODULE(filter, m) {
    m.def("apply_filter_cpp", &apply_filter_cpp, "Apply image filter in C++");
}
