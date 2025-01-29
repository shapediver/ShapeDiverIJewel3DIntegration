import { AssetManagerPlugin, CoreViewerApp, DiamondPlugin, DirectionalLight, LoadingScreenPlugin, mobileAndTabletCheck } from 'webgi';
import './styles.css';
import { ShapeDiverSessionPlugin } from './ShapeDiverSessionPlugin';
import { createUi } from '@shapediver/viewer.shared.demo-helper';

const urlParams = new URLSearchParams(window.location.search);
const TICKET = urlParams.get('ticket') || '1ca6e2bdebbcf437e1b5085ae397b2afeb6c8b0794456b3bc00c996b6a97e67e0b46ecd880b0f8af7bcfc4d2ca3fc3bf964f06423d88629da0dd0bec9b9ebd2e8f263f41da6e8c8d27f63ad039731b7343d5b77d934687ae1345cc15d0832a6a3ab396b4c27113-905a8b8fe96f369837bd5e94279ed2ad';
const MODEL_VIEW_URL = urlParams.get('modelViewUrl') || 'https://sdr8euc1.eu-central-1.shapediver.com';
const scene = urlParams.get('webgiScene');
const key = urlParams.get('webgiDiamondPlugin');
LoadingScreenPlugin.LS_DEFAULT_LOGO = '';

/**
 * Setup the WebGi viewer and add all necessary plugins
 * 
 * This function initializes the WebGi viewer and adds all necessary plugins to the viewer.
 * The plugins are added in the following order:
 * - LoadingScreenPlugin
 * - ShapeDiverSessionPlugin -> creates a session with the ShapeDiver API
 * - all others, see loadPlugins()
 */
const setup = async () => {
    // Initialize the viewer with a canvas element
    // You can read more about the viewer creation here: https://webgi.xyz/docs/manual/viewer-api#create-the-viewer
    const viewer = new CoreViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
    });
    // You can choose from various options when initializing the viewer. Please read more about them here: https://webgi.xyz/docs/api/classes/Viewer_Editor_Templates.CoreViewerApp#initialize
    if (scene) {
		viewer.addPluginSync(AssetManagerPlugin as any);
		await viewer.initialize();
		(
			viewer.getPlugin(
				LoadingScreenPlugin as any,
			)! as LoadingScreenPlugin
		).showFileNames = false;
		(
			viewer.getPlugin(
				LoadingScreenPlugin as any,
			)! as LoadingScreenPlugin
		).filesElement.style.display = 'none';
		await viewer.load(scene);
	} else {
		// You can choose from various options when initializing the viewer. Please read more about them here: https://webgi.xyz/docs/api/classes/Viewer_Editor_Templates.CoreViewerApp#initialize
		await viewer.initialize({ground: false});

		(
			viewer.getPlugin(
				LoadingScreenPlugin as any,
			)! as LoadingScreenPlugin
		).showFileNames = false;
		(
			viewer.getPlugin(
				LoadingScreenPlugin as any,
			)! as LoadingScreenPlugin
		).filesElement.style.display = 'none';
		viewer.setEnvironmentMap(
			'https://demo-assets.pixotronics.com/pixo/hdr/gem_2.hdr',
		);
		const light = new DirectionalLight(0xffffff, 2.5);
		light.position.set(1, 1, 1);
		viewer.scene.add(light);
	}
    // Add a key to the DiamondPlugin, if a key is provided
	if (key) {
		const diamondPlugin = await viewer.getOrAddPlugin(
			DiamondPlugin as any,
		);
		(diamondPlugin as any).setKey(key);
	}


    // Optionally you can also load a complete scene with the following line
    // The scene can be created and downloaded in the https://playground.ijewel3d.com/
    // await viewer.load(PATH_TO_SCENE);

     // Add the ShapeDiverSessionPlugin, which creates a session with the ShapeDiver API
     const shapeDiverSessionPlugin = await viewer.addPlugin(new ShapeDiverSessionPlugin({
        ticket: TICKET,
        modelViewUrl: MODEL_VIEW_URL,
    }));

    // Check if the device is a mobile device
    const isMobile = mobileAndTabletCheck();
    // Set the render scale
    viewer.renderer.renderScale = Math.min(isMobile ? 1.5 : 2, window.devicePixelRatio);

    // Create a session with the model and load default outputs.
    await shapeDiverSessionPlugin.init();

    // Create a demonstration UI for the parameters
    createUi(shapeDiverSessionPlugin.session!, document.getElementById('parameter-ui') as HTMLDivElement);

    // There are many other plugins that can be added to the viewer. Here is some documentation on them:
    // - https://webgi.xyz/docs/manual/plugins-basics
    // - https://webgi.xyz/docs/features
    // Some plugins, like the DiamondPlugin, are already included in the viewer by default.
    // You can read more about the diamond plugin here: https://webgi.xyz/docs/industries/jewellery/index.html
};

setup();
