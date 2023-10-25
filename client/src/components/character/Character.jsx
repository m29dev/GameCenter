import './character.css'

const Character = (data) => {
    return (
        <>
            <div className="character-box">
                {data?.theme === 'gray' && (
                    <h1
                        className="grays char-h1"
                        style={
                            data?.fontSize
                                ? { fontSize: `${data?.fontSize}px` }
                                : {}
                        }
                    >
                        {data?.character}
                    </h1>
                )}

                {data?.theme === 'purple' && (
                    <h1
                        className="purples char-h1"
                        style={
                            data?.fontSize
                                ? { fontSize: `${data?.fontSize}px` }
                                : {}
                        }
                    >
                        {data?.character}
                    </h1>
                )}

                {data?.theme === 'mint' && (
                    <h1
                        className="mint char-h1"
                        style={
                            data?.fontSize
                                ? { fontSize: `${data?.fontSize}px` }
                                : {}
                        }
                    >
                        {data?.character}
                    </h1>
                )}
            </div>
        </>
    )
}

export default Character
