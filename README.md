# Charter-Remix!

I wanted to explore using D3 for the first time. The API I decided to use was Yahoo finance through the yahoofinance2 npm package. This package has to be run on a Node server, so rather than creating a separate Node server, I opted to use Remix for that all-in-one experience.

<img width="1134" alt="chartshot" src="https://github.com/user-attachments/assets/7d61ce4d-dcdf-4934-8bd9-344a571fc468">

[Loom](https://www.loom.com/share/08a6c99dfa9b4514b10a46c4d1fbe5d8?sid=b1f21112-6a11-47d3-af77-bd704c1dcc14)

## Stack

- Remix / React
- D3

## Future improvements

- Selecting time periods should indicate which is currently selected
- Currently just made for the desktop browser - next up is to make this responsive for mobile devices
- Add some error boundaries
- Add transition animations between charts

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:
`

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
