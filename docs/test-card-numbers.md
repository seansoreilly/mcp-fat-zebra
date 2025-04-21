# Test Card Numbers

Fat Zebra provides test card numbers for use in the sandbox environment. Each card number has a predetermined purchase response code.

> **Important:** Use Test Card Numbers Only
>
> It is important that Merchants, Developers and Testers only use the provided test card numbers in the Fat Zebra Sandbox. If live card numbers are used the transactions will not be processed successfully.

## Predetermined Response Cards

For example, every purchase made with VISA 4005 5500 0000 0001 will respond with 00 Approved, and every purchase made with VISA 4557 0123 4567 8902 will respond with 05 Declined.

| Scheme         | Card number         | Purchase response code |
| -------------- | ------------------- | ---------------------- |
| Mastercard     | 5123 4567 8901 2346 | 00 Approved            |
| Mastercard     | 5313 5810 0012 3430 | 05 Declined            |
| VISA           | 4005 5500 0000 0001 | 00 Approved            |
| VISA           | 4557 0123 4567 8902 | 05 Declined            |
| AMEX           | 3456 789012 34564   | 00 Approved            |
| AMEX           | 3714 496353 98431   | 05 Declined            |
| JCB            | 3530 1113 3330 0000 | 00 Approved            |
| JCB            | 3566 0020 2036 0505 | 05 Declined            |
| China UnionPay | 6250946000000016    | 00 Approved            |
| China UnionPay | 6250947000000014    | 05 Declined            |

## Dynamic Response Cards

Fat Zebra also provides test card numbers that set the purchase response code using the last two digits of the purchase amount.

For example, a purchase of AUD$50.09 with any card number below will respond with 09 Acquirer Busy.

| Scheme         | Card number                                    | Purchase response code             |
| -------------- | ---------------------------------------------- | ---------------------------------- |
| Mastercard     | 5555 5555 5555 4444                            | Last two digits of purchase amount |
| Mastercard     | 2221 0012 3456 7896                            | Last two digits of purchase amount |
| VISA           | 4242 4242 4242 4242                            | Last two digits of purchase amount |
| VISA           | 4111 1111 1111 1111                            | Last two digits of purchase amount |
| VISA           | 4000 0012 3456 2345 678 (19 digit card number) | Last two digits of purchase amount |
| AMEX           | 3700 000000 00002                              | Last two digits of purchase amount |
| AMEX           | 3760 701663 31008                              | Last two digits of purchase amount |
| China UnionPay | 6222 8212 3456 0017                            | Last two digits of purchase amount |
| Discover       | 6011 3325 6061 8887                            | Last two digits of purchase amount |
| Discover       | 6011 1111 1111 1117                            | Last two digits of purchase amount |
| Diners         | 3670 01020 00000                               | Last two digits of purchase amount |

Refer to the [Response Codes](https://docs.fatzebra.com/docs/response-codes) documentation for the full list of response codes.
