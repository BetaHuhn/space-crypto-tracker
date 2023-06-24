# Cards Demo

## Built-in Cards

There are currently 4 built-in Cards that you can use with app actions:

- `@deta/raw`: renders any kind of output, be it strings, numbers, booleans or arbitrary objects
- `@deta/detail`: renders a detail card consisting of a title, text and image
- `@deta/file`: renders a file like images
- `@deta/list`: renders a list of items / cards

If you don't specify what card to use for an app action the `@deta/raw` card will be used.

To specify what card to use for an action define the `output` in the action declaration:

```json
{
    "actions": [
        {
            "name": "<action_name>",
            "path": "/<action_path>",
            "output": "<card name>"
        }
    ]
}
```

Depedening on what card you choose the data you return from your action needs to match the input of the card.

### `@deta/raw`

The `@deta/raw` card can render any kind of output like strings, numbers, booleans and objects.

Most data will be rendered as simple text, objects are rendered in a table.

**Props:**
<any>

### `@deta/detail`

The `@deta/detail` card can be used to show information with a title, text and image field. 

**Props:**

- `title`: text that will be shown as a heading
- `text`: short or long form text
- `image_url`: a URL that points to an image
- `url`: a URL that will be used for actions

### `@deta/file`

The `@deta/file` card can show a file like images.

**Props:**

- `url`: URL that points to the file
- `type`: the file type, if you want to render an image set it to `image`, all other types will not be displayed but an option download the file will be shown
- `name`: the file name

### `@deta/list`

The `@deta/list` card can render list of items that point to a URL or open a full card.

**Props:**

- `title`: title text to display before the list
- `description`: text to display before the list
- `items`: list of items
    - `title`: list item title
    - `description`: list item description
    - `url`: list item URL
    - `card`: card to show when opening the list item
        - `type`: card type
        - `data`: data that will be passed to the card

## Custom Cards

Take a look at the `cards` directory in this repo on how to set them up.

Cards are defined as Svelte components. To create a new card, create a new directory in `./src` with the name of the directory matching your card's name. Inside the directory create a `Card.svelte` file. This file is the actual card component, you can do anything you want inside of it.

Here is an example card component:

```svelte
<script lang="ts">
  export let name: string
</script>

<h1>Hello {name}</h1>
```

Here the `name` prop would be what you returned from your action.

To use the card you need to include it in the action's declaration. The card name is the name of the directory that your card component is in.

```json
{
    "actions": [
        {
            "name": "<action_name>",
            "path": "/<action_path>",
            "output": "<card name>"
        }
    ]
}
```

If you are using the `deta-space-actions` SDK you can define the card like this:

```js
const actions = createActions()

actions.add({
  name: 'example',
  title: 'Example Action',
  input: [
    Inputs('name').String(),
  ],
  card: 'example',
  handler: async event => {
      return {
        name: event.name
      }
  }
})
```

### Adding Cards to your App

For the client to be able to use the cards they need to be publicly available on `<instance-alias>.deta.app/cards/:card_name.js`.

If you use the Cards template this will be taken care of automatically thanks to the `deta-space-cards` library and a simple static Micro. The library is used to build your Svelte components and turn them into separate JS files in the right format and the static Micro serves them on `/cards`:

```yml
v: 0
micros:
  - name: cards
    path: /cards
    src: ./cards
    engine: static
    serve: dist
    commands:
      - npm run build
    public: true
```


### Card Context

Whatever data the action returns will be passed as props to your components.

Additionally each card will automatically be passed the `context` prop which includes information about the card and action as well as some helpful functions:

```ts
type Context = {
    // Close the card
    close: () => any;
    // Show a success notification
    showSuccess: (message: string) => any;
    // Show a error notification
    showError: (message: string) => any;
    // The action that generated the card
    action: {
        title: string;
        name: string;
        app_name: string;
        instance_id: string;
        instance_alias: string;
        channel: string;
        version: string;
    };
    // A wrapper around fetch that you can use to make requests to the Card's app / backend Micro(s)
    fetch: (path: string, opts?: RequestInit) => Promise<Response>
    // Invoke other app actions (if you omit the instanceId it will use the id of the instance the card belongs to)
    invokeAction: (name: string, payload?: any, instanceId?: string) => Promise<unknown>;
};
```

Let us know if there are any other functions that would be useful for you to have in the context. If you need to use the Deta SDK you can just add it as a dependency and import it like you would normally.
