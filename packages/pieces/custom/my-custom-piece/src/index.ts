import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { createAction, Property } from '@activepieces/pieces-framework';

export const myCustomAction = createAction({
  name: 'my_custom_action',
  displayName: 'My Custom Action',
  description: 'This is a custom action example',
  props: {
    message: Property.ShortText({
      displayName: 'Message',
      description: 'Enter a message',
      required: true,
    }),
  },
  async run(context) {
    const { message } = context.propsValue;
    return {
      success: true,
      message: `Hello from custom piece: ${message}`,
      timestamp: new Date().toISOString(),
    };
  },
});

export const myCustomPiece = createPiece({
  displayName: 'My Custom Piece',
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/custom.png',
  authors: ['Custom Developer'],
  actions: [myCustomAction],
  triggers: [],
});