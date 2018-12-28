import * as assert from "assert"

import { PackageIdentifier } from "./definition"

/** Finds masters and nested masters, will rewrite images and code component references. */
export function findMasters(node: any, packageIdentifier: PackageIdentifier, masters: any[]) {
    if (!node.id || node.replicaInfo) return

    const children = node.children || []
    for (const child of children) {
        findMasters(child, packageIdentifier, masters)
    }

    if (!node.isMaster || (node.isExternalMaster && node.isExternalMaster !== packageIdentifier)) {
        return
    }

    const master = updateJSONMaster(node, `${packageIdentifier}-${node.id}-`, packageIdentifier, null)
    master.id = `${packageIdentifier}-${node.id}`
    master.isMaster = true
    master.isExternalMaster = packageIdentifier
    master.top = 0
    master.left = 0
    master.bottom = null
    master.right = null
    masters.push(master)
}

function ensureAbsoluteReferences(node: any, packageIdentifier: string) {
    const { codeComponentIdentifier, fillImage, replicaInfo } = node
    // TODO: Better way to decide if reference is local?
    if (codeComponentIdentifier && codeComponentIdentifier.startsWith(".")) {
        node.codeComponentIdentifier = `${packageIdentifier}/${codeComponentIdentifier}`
    }
    if (fillImage) {
        node.fillImage = `node_modules/${packageIdentifier}/design/images/${fillImage}`
    }
    // Make sure that a reference to another master in the
    // same package is also updated to include a prefix.
    // TODO: Better way to decide if reference is local?
    if (replicaInfo && replicaInfo.master.indexOf("-") === -1) {
        node.replicaInfo = { ...replicaInfo, master: `${packageIdentifier}-${replicaInfo.master}` }
    }
}

function updateJSONMaster(
    node: any,
    idPrefix: string,
    packageIdentifier: PackageIdentifier,
    parentid: string | null
): any {
    assert(!node.id.startsWith(idPrefix))

    const id = idPrefix + node.id

    let children: any = undefined
    if (node.children && Array.isArray(node.children)) {
        children = node.children.map((child: any) => updateJSONMaster(child, idPrefix, packageIdentifier, id))
    }

    const clone = { ...node, id, parentid, children, isMaster: false }
    ensureAbsoluteReferences(clone, packageIdentifier)

    return clone
}
