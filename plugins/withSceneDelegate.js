const { withAppDelegate } = require('@expo/config-plugins');

module.exports = function withSceneDelegate(config) {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Remove the legacy direct window-creation block, if present
    const windowBlockRegex = /#if os\(iOS\) \|\| os\(tvOS\)\n(?:.*\n)*?#endif\n/;
    contents = contents.replace(windowBlockRegex, '');

    // Add the scene-configuration handoff method, if not already present
    if (!contents.includes('configurationForConnecting connectingSceneSession')) {
      const anchor = 'return super.application(application, didFinishLaunchingWithOptions: launchOptions)\n  }\n';
      const newMethod = anchor + `
  public func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    configuration.delegateClass = SceneDelegate.self
    return configuration
  }
`;
      contents = contents.replace(anchor, newMethod);
    }

    // Append the SceneDelegate class, if not already present
    if (!contents.includes('class SceneDelegate')) {
      contents = contents.trimEnd() + `

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let sceneWindow = UIWindow(windowScene: windowScene)
    factory.startReactNative(
      withModuleName: "main",
      in: sceneWindow,
      launchOptions: nil)

    self.window = sceneWindow
    appDelegate.window = sceneWindow
    sceneWindow.makeKeyAndVisible()
  }
}
`;
    }

    config.modResults.contents = contents;
    return config;
  });
};
