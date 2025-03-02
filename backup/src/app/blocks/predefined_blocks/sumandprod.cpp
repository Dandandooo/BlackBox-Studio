#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    std::string inputStr = argv[1];

    // Parse x and y from input "[x,y]"
    size_t commaPos = inputStr.find(',');
    double x = std::stod(inputStr.substr(1, commaPos - 1));
    double y = std::stod(inputStr.substr(commaPos + 1, inputStr.size() - commaPos - 2));

    double result_sum = x + y;
    double result_product = x * y;

    // Output as JSON array
    std::cout << "[" << result_sum << "," << result_product << "]" << std::endl;

    return 0;
}
