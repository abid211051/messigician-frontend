This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- Next Task -->

Is this calculation actualy valid or logical? I actualy can't decide if a mixed sheet is valid or not. Now in summary tab against user calcuatio is ok if we assume dynamic and fixed meal rate in a sheet. But if sheet is mixed type i saw fixed meal and dynamic meals both counts are getting sum and dividing the total shopping amount to get the dynamic meal rate. So in this case does a dynamic sheet actually calucating meal, shopping money ration accurately or not? We could exclude the fixed rate column and calcuate with dynamic rates, but in that case meal count will be less and meal rates will surge up. But if we consider fixed rates meal in count then i acutally can decide if this is correct cash flow in whole sheet or not. So can you come up with more better idea? Or we should keep a hard restriction in dynamic and fixed settings? I mean if one column is converted to the fixed, then all others phase column will also be fixed, and setting amount for others field is owner own desire, otherwise in thoe phase meal rate will count as zero. And if one phase is switched to dynamic all other column will be same, and as in dynamic no need to fixed dynamic meal rate so those fixed rates will kept hidden. 
