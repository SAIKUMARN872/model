"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
var react_1 = require("react");
function SettingsPage() {
    var _a = (0, react_1.useState)("Light"), theme = _a[0], setTheme = _a[1];
    var _b = (0, react_1.useState)(true), notifications = _b[0], setNotifications = _b[1];
    return (<main className="min-h-screen p-8">


      <h1 className="text-3xl font-bold">

        Settings

      </h1>


      <p className="mt-2 text-gray-600">

        Manage application preferences.

      </p>



      <div className="mt-8 space-y-5">


        <div className="border rounded-lg p-5">


          <h2 className="text-xl font-semibold">

            Theme

          </h2>


          <select value={theme} onChange={function (e) { return setTheme(e.target.value); }} className="mt-3 border rounded p-2">

            <option>Light</option>

            <option>Dark</option>

            <option>System</option>

          </select>


        </div>




        <div className="border rounded-lg p-5">


          <h2 className="text-xl font-semibold">

            Notifications

          </h2>


          <button onClick={function () { return setNotifications(!notifications); }} className="mt-3 border rounded px-4 py-2">

            {notifications ? "Enabled" : "Disabled"}

          </button>


        </div>



        <div className="border rounded-lg p-5">


          <h2 className="text-xl font-semibold">

            Account

          </h2>


          <p className="mt-2">

            Manage user account preferences.

          </p>


        </div>


      </div>


    </main>);
}
