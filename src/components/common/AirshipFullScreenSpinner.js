// @flow

import React, { Component } from 'react'
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native'
import { type AirshipBridge } from 'react-native-airship'

import { THEME } from '../../theme/variables/airbitz.js'
import { scale } from '../../util/scaling.js'

const fadeInTime = 300
const fadeOutTime = 1000
const visibleTime = 3000

type Props = {
  bridge: AirshipBridge<void>,
  // The message to show in the toast:
  message?: string,
  // If set, the toast will stay up for the lifetime of the promise,
  // and will include a spinner.
  activity?: Promise<mixed>
}

export class AirshipFullScreenSpinner extends Component<Props> {
  opacity: Animated.Value

  constructor(props: Props) {
    super(props)
    this.opacity = new Animated.Value(0)
  }

  componentDidMount() {
    const { activity, bridge } = this.props

    // Animate in:
    Animated.timing(this.opacity, {
      toValue: 0.9,
      duration: fadeInTime,
      useNativeDriver: true
    }).start()

    // Animate out:
    const hide = () => {
      bridge.resolve()
      Animated.timing(this.opacity, {
        toValue: 0,
        duration: fadeOutTime,
        useNativeDriver: true
      }).start(() => bridge.remove())
    }
    if (activity != null) {
      activity.then(hide, hide)
    } else {
      setTimeout(hide, fadeInTime + visibleTime)
    }
  }

  render() {
    return (
      <Animated.View style={[styles.container, { opacity: this.opacity }]}>
        <View style={styles.darkness} />
        <View style={styles.body}>{this.renderContent()}</View>
      </Animated.View>
    )
  }

  renderContent() {
    const { activity, message } = this.props
    if (activity == null) return <Text style={styles.text}>{message}</Text>

    return (
      <>
        <Text style={[styles.text, { marginRight: unit }]}>{message}</Text>
        <ActivityIndicator />
      </>
    )
  }
}

const unit = scale(13)

const styles = StyleSheet.create({
  container: {
    // Layout:
    padding: unit,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,

    // Children:
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  },

  darkness: {
    // Layout:
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,

    // Visuals:
    backgroundColor: THEME.COLORS.SHADOW,
    opacity: THEME.OPACITY.MODAL_DARKNESS
  },

  body: {
    // Layout:
    maxWidth: 32 * unit,

    // Visuals:
    backgroundColor: THEME.COLORS.GRAY_3,
    borderRadius: (3 / 2) * unit,

    // Children:
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: unit
  },

  text: {
    color: THEME.COLORS.BLACK,
    flexShrink: 1,
    fontFamily: THEME.FONTS.DEFAULT,
    fontSize: unit,
    textAlign: 'center'
  }
})
