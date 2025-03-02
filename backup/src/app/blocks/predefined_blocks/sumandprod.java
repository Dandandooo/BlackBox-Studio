public class SumAndProd {
    public static void main(String[] args) {
        String inputStr = args[0];

        // Remove brackets [ ]
        inputStr = inputStr.substring(1, inputStr.length() - 1);

        // Split on comma
        String[] parts = inputStr.split(",");

        double x = Double.parseDouble(parts[0]);
        double y = Double.parseDouble(parts[1]);

        double resultSum = x + y;
        double resultProduct = x * y;

        // Output as JSON array
        System.out.println("[" + resultSum + "," + resultProduct + "]");
    }
}
