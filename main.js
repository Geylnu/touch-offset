function getOffsetPosition(x, y, elOrCache) {
    function getVertexPosition(el) {
        let currentTarget = el
        let top = 0
        let left = 0
        while (currentTarget !== null) {
            top += currentTarget.offsetTop
            left += currentTarget.offsetLeft
            currentTarget = currentTarget.offsetParent
        }
        return { top, left }
    }

    function getTranformData(el) {
        let style = window.getComputedStyle(el)
        let transform = style.transform
        let transformOrigin = style.transformOrigin

        let origin = { x: 0, y: 0 }
        let matrix = math.ones([3, 3])
        if (transform !== 'none') {
            let originArray = transformOrigin.split(' ')
            origin.x = parseInt(originArray[0])
            origin.y = parseInt(originArray[1])

            let matrixString = transform.match(/\(([^)]*)\)/)[1]
            let stringArray = matrixString.split(',')
            let temp = []
            stringArray.forEach((value) => {
                temp.push(parseFloat(value.trim()))
            })
            temp = [
                [temp[0], temp[2], temp[4]],
                [temp[1], temp[3], temp[5]],
                [0, 0, 1],
            ]

            matrix = math.inv(temp)
        } else {
            matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        }
        return { matrix, origin }
    }

    function computPosition(data) {
        data.forEach((obj) => {
            let { temp, origin, vertex: { left, top } } = obj
            x = x - left - origin.x
            y = y - top - origin.y
            let result = math.multiply(temp, [x, y, 1])
            x = result[0] + origin.x
            y = result[1] + origin.y
        })
        return { x, y }
    }

    let data = []
    if (elOrCache instanceof Node) {
        el = elOrCache
        while (el !== null && el.nodeType === 1) {
            let { left, top } = getVertexPosition(el)
            let transformData = getTranformData(el)
            temp = transformData.matrix
            origin = transformData.origin

            if (data.length > 0) {
                data[0].vertex.left -= left
                data[0].vertex.top -= top
            }
            data.unshift({
                temp, origin, vertex: {
                    left, top
                },
            })
            el = el.parentNode
        }
    } else if (elOrCache instanceof Array) {
        data = elOrCache
    }
    let pos = computPosition(data)
    return { x: pos.x, y: pos.y, data }
}