from datetime import datetime

# 3rd party modules
from flask import make_response, abort

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

# Data to serve with our API
DEPENDENCIES = {
    "101": {
        "networkId": "101",
        "networkName": "DeBoarding",
        "dependsOnNetworkId": "100",
        "startNetworkTime": get_timestamp(),
        "endNetworkTime": get_timestamp(),
    },
    "100": {
        "networkId": "100",
        "networkName": "Unloading",
        "dependsOnNetworkId": "102",
        "startNetworkTime": get_timestamp(),
        "endNetworkTime": get_timestamp(),
    },
    "102": {
        "networkId": "102",
        "networkName": "Cleaning",
        "dependsOnNetworkId": "",
        "startNetworkTime": get_timestamp(),
        "endNetworkTime": get_timestamp(),
    }
}

# Create a handler for our read (GET) dependencies
def read_all():
    # Create the list of tasks from our data
    return [DEPENDENCIES[key] for key in sorted(DEPENDENCIES.keys())]

def create(task):
    networkId = task.get("networkId", None)
    networkName = task.get("networkName", None)
    dependsOnNetworkId = task.get("dependsOnNetworkId", None)
    startNetworkTime = task.get("startNetworkTime", None)
    endNetworkTime = task.get("endNetworkTime", None)

    # Does the task exist already?
    if networkId not in DEPENDENCIES and networkId is not None:
        DEPENDENCIES[networkId] = {
            "networkId": networkId,
            "networkName": networkName,
            "dependsOnNetworkId": dependsOnNetworkId,
            "startNetworkTime": get_timestamp(),
            "endNetworkTime": get_timestamp(),
        }
        return DEPENDENCIES[networkId], 201

    # Otherwise, they exist, that's an error
    else:
        abort(
            406,
            "Task with id {networkId} already exists".format(networkId=networkId),
        )


def delete(networkId):
    # Does the task to delete exist?
    if networkId in DEPENDENCIES:
        del DEPENDENCIES[networkId]
        return make_response(
            "{networkId} successfully deleted".format(networkId=networkId), 200
        )

    # Otherwise, nope, task to delete not found
    else:
        abort(
            404, "Dependency with task id {networkId} not found".format(networkId=networkId)
        )
