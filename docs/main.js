import { writeTestValue } from './db.js';

function start() {
  registerServiceWorker();
  const checker = document.getElementById('check');
  checker.addEventListener('click', () => {
    fetch('/');
  });
  document.getElementById('populate').addEventListener('click', () => {
    writeToDatabase();
  });
}

async function writeToDatabase() {
  const value = (new Date()).toLocaleTimeString();
  try {
    await writeTestValue(value);
    log('Wrote to database with: ' + value);
  } catch (ex) {
    log('Failed to write to database.');
    console.error('Error: ', ex);
  }
}

async function registerServiceWorker() {
  try {
    const reg = await navigator.serviceWorker.register('./sw.js', {
      type: 'module'
    });
    reg.update();

    navigator.serviceWorker.addEventListener("message", (event) => {
      log('Got message: ' + event.data?.msg);
    });
  } catch (ex) {
    console.error('Failed to register SW:', ex);
  }
}

function log(message) {
  const messages = document.getElementById('messages');
  const li = document.createElement('li');
  li.innerText = message;

  messages.appendChild(li);
}

start();
