import { AlertCircle, Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
              <h2 className="ml-2 text-xl font-heading font-bold">DisasterResponse AI</h2>
            </div>
            <p className="text-neutral-400 text-sm mb-4">
              AI-powered disaster prediction, response, and management system designed to save lives and optimize resource allocation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API Reference</a></li>
              <li><a href="#" className="hover:text-white">Tutorials</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Emergency Links</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="https://www.fema.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-white">FEMA Resources</a></li>
              <li><a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-white">National Weather Service</a></li>
              <li><a href="https://www.redcross.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Red Cross</a></li>
              <li><a href="#" className="hover:text-white">Emergency Contacts</a></li>
              <li><a href="#" className="hover:text-white">Local Authorities</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Download the App</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Get real-time alerts and access to evacuation routes directly on your mobile device.
            </p>
            <div className="space-y-2">
              <a
                href="#"
                className="block px-4 py-2 border border-neutral-700 rounded hover:bg-neutral-800 text-sm text-center"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 inline-block mr-1" fill="currentColor">
                  <path
                    d="M17.5185 3.87254C17.0296 4.44618 16.1617 4.90837 15.4487 4.90837C15.4111 4.90837 15.3748 4.90582 15.339 4.90072C15.6094 4.26322 16.4774 3.61081 17.2427 3.61081C17.2795 3.61081 17.3151 3.61336 17.3505 3.61846C17.4158 3.70536 17.4774 3.78968 17.5185 3.87254ZM13.517 5.14009C12.5193 5.14009 11.885 5.83695 11.4631 5.83695C11.0159 5.83695 10.3322 5.17218 9.51232 5.17218C7.89505 5.17218 6 6.5985 6 9.27272C6 10.9869 6.55446 12.784 7.28545 13.9692C7.91304 14.9777 8.455 15.7318 9.21213 15.7318C9.94592 15.7318 10.4446 15.1097 11.4174 15.1097C12.429 15.1097 12.8356 15.7445 13.6784 15.7445C14.4554 15.7445 14.9967 14.9138 15.6103 13.9311C16.2175 12.9675 16.5064 12.0356 16.5178 12.0037C16.4547 11.9844 14.6525 11.2572 14.6525 9.14782C14.6525 7.32877 16.0684 6.54309 16.1608 6.45877C15.3219 5.15659 14.0161 5.14009 13.517 5.14009Z"
                    fill="currentColor"
                  ></path>
                </svg>
                Download for iOS
              </a>
              <a
                href="#"
                className="block px-4 py-2 border border-neutral-700 rounded hover:bg-neutral-800 text-sm text-center"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 inline-block mr-1" fill="currentColor">
                  <path
                    d="M12.7392 10.2741L9.23857 6.49643L16.3358 2.7002C16.5017 2.61074 16.6872 2.59186 16.8529 2.64356L12.7392 10.2741ZM7.98273 5.72665L11.924 9.95463L7.28226 17.7488L7.24737 17.5767C7.18344 17.2514 7.2826 16.9065 7.52274 16.6588L10.4696 13.6265L7.54 15.2506C7.34603 15.3631 7.11823 15.3902 6.9015 15.3223C6.68477 15.2543 6.50572 15.0972 6.40523 14.8906C6.3537 14.792 6.32344 14.6862 6.31566 14.5783L6.7099 9.211C6.73252 8.94852 6.86024 8.70385 7.06427 8.53218C7.26831 8.36051 7.53129 8.27458 7.79603 8.29239C7.87868 8.29768 7.9573 8.31493 8.03189 8.34348L7.98273 5.72665ZM11.9002 11.4918L13.0602 12.7292L8.37752 15.3001L11.9002 11.4918ZM16.7427 3.70536L12.4554 11.6681L15.957 15.396C16.0249 15.4689 16.0849 15.5545 16.1302 15.6567L16.1826 15.7857L18.2005 12.1607C18.3009 11.9541 18.3276 11.7194 18.2767 11.4951C18.2258 11.2708 18.1002 11.0702 17.9228 10.9266L15.7523 9.00591L18.3124 8.07091C18.5144 8.00198 18.7342 8.01425 18.9276 8.10522C19.121 8.19619 19.2746 8.35941 19.3586 8.56329C19.4022 8.66857 19.4251 8.77919 19.4258 8.89072L19.7233 14.5239C19.7337 14.7844 19.6444 15.0392 19.4731 15.2366C19.3018 15.434 19.0629 15.5582 18.8025 15.5777C18.7034 15.5842 18.6097 15.576 18.5179 15.5529L16.7427 3.70536Z"
                    fill="currentColor"
                  ></path>
                </svg>
                Download for Android
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} DisasterResponse AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
